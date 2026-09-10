# Blackout Esports Front Admin

## Configurar acceso administrativo con Microsoft Entra ID

La web usa `@azure/msal-react` y muestra el panel `#admin` a cualquier cuenta autenticada. El inicio de sesión está configurado para el tenant indicado en `VITE_ENTRA_TENANT_ID`.

1. En **Microsoft Entra ID > Registros de aplicaciones**, crea o selecciona una aplicación de tipo SPA.
2. En **Autenticación > Plataforma: Single-page application**, añade exactamente estas dos URI de redirección:
	- `http://localhost:5173`
	- `http://127.0.0.1:5173`
	No las añadas como plataforma **Web** ni incluyas una barra final.
3. Copia `.env.example` como `.env.local` y completa `VITE_ENTRA_TENANT_ID` y `VITE_ENTRA_CLIENT_ID`.
4. Arranca la aplicación con `npm run dev` e inicia sesión desde **Iniciar sesión**.

Los cambios del panel se guardan actualmente en `localStorage` del navegador. Para que varios administradores compartan los cambios y exista persistencia real, el siguiente paso es conectar el panel a una API protegida con el access token de Entra ID.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
