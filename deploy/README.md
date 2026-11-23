# Autorización JWT del Gateway

Esta configuración está preparada; no ha sido aplicada ni validada contra AWS en esta sesión.

AWS HTTP API admite un emisor por autorizador JWT. Se preparan dos: Entra (audience de la API y scope PanelAdministrativo) y Cognito (client_id y scope openid). Los catálogos y el marcador conservan lectura pública. Las escrituras y consultas administrativas requieren Entra. Academy /me y novedades de fans requieren Cognito. El frontend usa /api/notifications/staff para novedades de Entra. Los roles Admin/Staff siguen validándose en cada backend: validar una firma en el Gateway no sustituye la autorización del negocio.

El script usa AWS CLI y el HTTP API existente, sin crear instancias, API nuevas ni integraciones. Por defecto solo lee AWS e imprime un plan. Requiere que la integración conserve la ruta completa mediante overwrite:path=$request.path. Si no puede deducir el destino, aborta. Antes de aplicar guarda una copia de rutas, integraciones, autorizadores y etapas; no sobreescribe una copia previa. Usa --apply solo después de revisar el plan y desplegar las rutas nuevas del backend/frontend.

```bash
python deploy/gateway_jwt.py
python deploy/gateway_jwt.py --apply --backup gateway-before.json
```

No usar --apply con una sesión de otra cuenta. Revisar gateway-jwt.json si cambian el tenant, app cliente, pool o API. No almacena contraseñas. El script no es una transacción: si AWS rechaza una operación, hay que revisar el estado parcial y el respaldo antes de reintentar. Las etapas con AutoDeploy publican cambios al guardarlos. Al terminar hay que comprobar accesos públicos, 401 sin token en rutas protegidas, 403 con rol no autorizado, y solicitudes válidas con ambos proveedores.

Las pruebas locales verifican el plan, los emisores por ruta y el rechazo de integraciones que pierden la ruta. No prueban las políticas IAM de AWS Academy ni sustituyen una prueba real de tokens en el Gateway.

Referencia: https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html
