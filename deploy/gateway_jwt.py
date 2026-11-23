"""Planifica cambios sobre el HTTP API existente. Solo escribe en AWS con --apply.

No crea API, instancia ni integración. Conserva los destinos actuales y exige que
la integración HTTP reenvíe la ruta completa antes de adjuntar autorizadores.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess


def desired_routes():
    routes = {"$default": "entra", "ANY /{proxy+}": "entra", "OPTIONS /{proxy+}": None, "GET /": None}
    for prefix, resource in [("players", "players"), ("tournaments", "tournaments"), ("roster", "rosters")]:
        routes[f"GET /{prefix}/api/{resource}"] = None
        routes[f"GET /{prefix}/api/{resource}/{{id}}"] = None
    for prefix in ["players", "tournaments", "roster", "users"]:
        routes[f"GET /{prefix}/v3/api-docs"] = None
        routes[f"GET /{prefix}/swagger-ui.html"] = None
        routes[f"GET /{prefix}/swagger-ui/{{proxy+}}"] = None
    routes.update({
        "GET /tournaments/api/matches": None,
        "GET /tournaments/api/matches/statistics": None,
        "GET /tournaments/api/matches/manage": "entra",
        "POST /tournaments/api/matches": "entra",
        "POST /tournaments/api/matches/{id}/commands": "entra",
        "GET /users/api/users/me": "cognito",
        "GET /users/api/notifications": "cognito",
        "GET /users/api/notifications/staff": "entra",
        "GET /users/api/academy/me": "cognito",
        "POST /users/api/academy/me": "cognito",
        "GET /users/api/academy/applications": "entra",
        "GET /users/api/academy/applications/audit": "entra",
        "PUT /users/api/academy/applications/{id}/decision": "entra",
    })
    return routes


def target_for(key, existing):
    exact = next((r for r in existing if r["RouteKey"] == key), None)
    if exact:
        return exact.get("Target")
    path = key.split(" ", 1)[-1] if key != "$default" else "/"
    method = key.split(" ", 1)[0]
    candidates = []
    for route in existing:
        route_key = route["RouteKey"]
        if route_key == "$default":
            candidates.append((0, route.get("Target")))
            continue
        verb, pattern = route_key.split(" ", 1)
        if verb not in (method, "ANY"):
            continue
        # Ordena por segmentos estáticos, no por el largo del nombre de un parámetro.
        regex = "/".join(".+" if s.endswith("+}") else "[^/]+" if s.startswith("{") else re.escape(s) for s in pattern.split("/"))
        if re.fullmatch(regex, path):
            score = 1 + sum(len(s) for s in pattern.split("/") if not s.startswith("{"))
            candidates.append((score, route.get("Target")))
    if not candidates:
        # Un $default nuevo solo puede usar un destino global ya existente.
        if key == "$default":
            return next((r.get("Target") for r in existing if r["RouteKey"] == "ANY /{proxy+}"), None)
        return None
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def build_plan(snapshot):
    if snapshot["api"].get("ProtocolType") != "HTTP":
        raise ValueError("La configuración solo admite HTTP APIs")
    existing = snapshot["routes"].get("Items", [])
    policy = desired_routes()
    # Ninguna ruta antigua conserva accidentalmente acceso público a escrituras.
    for route in existing:
        policy.setdefault(route["RouteKey"], None if route["RouteKey"].startswith("OPTIONS ") else "entra")
    integrations = {"integrations/" + i["IntegrationId"]: i for i in snapshot["integrations"].get("Items", [])}
    result = []
    for key, authorizer in policy.items():
        target = target_for(key, existing)
        if not target or target not in integrations:
            raise ValueError(f"No se puede deducir el destino de {key}; revisa las integraciones antes de aplicar")
        integration = integrations[target]
        if integration.get("IntegrationType") != "HTTP_PROXY" or integration.get("RequestParameters", {}).get("overwrite:path") != "$request.path":
            raise ValueError(f"{target} debe ser HTTP_PROXY y reenviar $request.path sin perder el prefijo")
        result.append({"route_key": key, "target": target, "authorizer": authorizer})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("gateway-jwt.json"))
    parser.add_argument("--snapshot", type=Path, help="Exportación local para planificar sin acceso a AWS")
    parser.add_argument("--apply", action="store_true", help="Aplica autorizadores y rutas; requiere sesión AWS")
    parser.add_argument("--backup", type=Path, default=Path("gateway-before.json"))
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))

    def aws(operation, **fields):
        payload = {"ApiId": config["api_id"], **fields}
        result = subprocess.run(["aws", "apigatewayv2", operation, "--region", config["region"],
                                 "--cli-input-json", json.dumps(payload), "--output", "json", "--no-cli-pager"],
                                check=True, capture_output=True, text=True)
        return json.loads(result.stdout) if result.stdout.strip() else {}

    if args.apply and args.snapshot:
        parser.error("--apply exige leer el estado actual de AWS; no admite un snapshot antiguo")
    snapshot = json.loads(args.snapshot.read_text(encoding="utf-8")) if args.snapshot else {
        "api": aws("get-api"), "routes": aws("get-routes"), "integrations": aws("get-integrations"),
        "authorizers": aws("get-authorizers"), "stages": aws("get-stages")}
    plan = build_plan(snapshot)
    print(json.dumps({"authorizers": config["authorizers"], "routes": plan}, indent=2, ensure_ascii=False))
    if not args.apply:
        print("Solo planificación: no se ha modificado AWS.")
        return
    # Se conserva el estado anterior, nunca tokens ni credenciales AWS.
    with args.backup.open("x", encoding="utf-8") as backup:
        json.dump(snapshot, backup, indent=2)
    ids = {}
    for key, definition in config["authorizers"].items():
        previous = next((a for a in snapshot["authorizers"].get("Items", []) if a["Name"] == definition["name"]), None)
        fields = {"Name": definition["name"], "AuthorizerType": "JWT", "IdentitySource": ["$request.header.Authorization"],
                  "JwtConfiguration": {"Issuer": definition["issuer"], "Audience": definition["audience"]}}
        if previous:
            result = aws("update-authorizer", AuthorizerId=previous["AuthorizerId"], **fields)
        else:
            result = aws("create-authorizer", **fields)
        ids[key] = result["AuthorizerId"]
    existing = {r["RouteKey"]: r for r in snapshot["routes"].get("Items", [])}
    for entry in plan:
        kind = entry["authorizer"]
        fields = {"RouteKey": entry["route_key"], "Target": entry["target"],
                  "AuthorizationType": "JWT" if kind else "NONE", "AuthorizationScopes": config["authorizers"][kind]["scopes"] if kind else []}
        if kind:
            fields["AuthorizerId"] = ids[kind]
        previous = existing.get(entry["route_key"])
        if previous:
            aws("update-route", RouteId=previous["RouteId"], **fields)
        else:
            aws("create-route", **fields)
    for stage in snapshot["stages"].get("Items", []):
        if not stage.get("AutoDeploy"):
            deployment = aws("create-deployment", Description="Autorización JWT Blackout final")
            aws("update-stage", StageName=stage["StageName"], DeploymentId=deployment["DeploymentId"])
    print("Configuración aplicada. Falta comprobar accesos públicos, Cognito y Entra con sesiones reales.")


if __name__ == "__main__":
    main()
