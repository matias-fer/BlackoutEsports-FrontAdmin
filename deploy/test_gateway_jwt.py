import unittest
from gateway_jwt import build_plan


class GatewayPlanTests(unittest.TestCase):
    def snapshot(self):
        return {"api": {"ProtocolType": "HTTP"}, "routes": {"Items": [
            {"RouteKey": "$default", "Target": "integrations/main"},
            {"RouteKey": "POST /players/api/players", "Target": "integrations/main"}]},
            "integrations": {"Items": [{"IntegrationId": "main", "IntegrationType": "HTTP_PROXY",
                "RequestParameters": {"overwrite:path": "$request.path"}}]}}

    def test_separates_identities_and_preserves_public_scoreboard(self):
        routes = {r["route_key"]: r for r in build_plan(self.snapshot())}
        self.assertIsNone(routes["GET /tournaments/api/matches"]["authorizer"])
        self.assertEqual("entra", routes["POST /players/api/players"]["authorizer"])
        self.assertEqual("entra", routes["GET /tournaments/api/matches/manage"]["authorizer"])
        self.assertEqual("cognito", routes["POST /users/api/academy/me"]["authorizer"])
        self.assertEqual("entra", routes["GET /users/api/notifications/staff"]["authorizer"])
        self.assertEqual("entra", routes["$default"]["authorizer"])

    def test_refuses_integration_that_loses_original_path(self):
        snapshot = self.snapshot()
        snapshot["integrations"]["Items"][0]["RequestParameters"] = {}
        with self.assertRaises(ValueError):
            build_plan(snapshot)

    def test_refuses_missing_target(self):
        snapshot = self.snapshot()
        snapshot["routes"]["Items"] = []
        with self.assertRaises(ValueError):
            build_plan(snapshot)


if __name__ == "__main__":
    unittest.main()
