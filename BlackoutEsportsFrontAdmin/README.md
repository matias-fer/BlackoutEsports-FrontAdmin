# Blackout Esports Front Admin

## Configurar acceso administrativo con Microsoft Entra ID

La web usa exclusivamente Microsoft Entra ID mediante `@azure/msal-react` para iniciar sesión. El panel `#admin` se muestra a las cuentas con el rol `Admin` en el ID token. El inicio de sesión está configurado para el tenant indicado en `VITE_ENTRA_TENANT_ID`. Las antiguas cuentas y sesiones locales ya no se utilizan.

1. En **Microsoft Entra ID > Registros de aplicaciones**, crea o selecciona una aplicación de tipo SPA.
2. En **Autenticación > Plataforma: Single-page application**, añade exactamente estas dos URI de redirección:
	- `http://localhost:5173`
	- `http://127.0.0.1:5173`
	No las añadas como plataforma **Web** ni incluyas una barra final.
3. Copia `.env.example` como `.env.local` y completa `VITE_ENTRA_TENANT_ID` y `VITE_ENTRA_CLIENT_ID`.
4. Arranca la aplicación con `npm run dev` e inicia sesión desde **Iniciar sesión**.

Los torneos se consultan y guardan en el microservicio de torneos. Jugadores y roster mantienen su almacenamiento local actual.

## Conexión de torneos

1. Ejecuta BlackoutEsports-Tournaments-Backend, rama feature-tournaments, con `docker compose up --build`.
2. Configura `VITE_TOURNAMENTS_API_URL=http://localhost:8082` en `.env.local` y reinicia Vite. No añadas `/api/tournaments` a esta variable.
3. La página Torneos consulta la API. En el panel, selecciona un torneo para editarlo o eliminarlo, o «Agregar torneo» para crearlo. El panel sigue requiriendo Entra ID y rol Admin.
4. Verifica que los cambios persisten al recargar. Los torneos antiguos del navegador no se migran automáticamente.

El backend debe permitir el origen del frontend mediante CORS. Su configuración local incluye localhost:5173 y 127.0.0.1:5173. Los fallos de conexión muestran un error y la opción Reintentar.

El envío y la validación del access token siguen pendientes: esta conexión usa el CRUD local actual, que todavía no protege sus operaciones. El rol de la interfaz no sustituye la autorización en el backend.

Prueba del cliente HTTP: `node --test tests/tournaments-api.test.mjs`. Utiliza respuestas simuladas y no sustituye la prueba con PostgreSQL y Entra ID.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
