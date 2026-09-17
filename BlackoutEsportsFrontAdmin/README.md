# Blackout Esports Front Admin

## Autenticación y permisos

La aplicación admite los dos accesos definidos para Blackout Esports:

- Microsoft Entra ID para personal con rol `Admin` o `Staff`. El access token de la API habilita el panel y autoriza las operaciones de escritura.
- Amazon Cognito para fans. Su access token permite consultar jugadores, torneos y roster, pero los microservicios rechazan cualquier escritura.

No existe inicio de sesión local ni se almacenan contraseñas en el navegador.

## Configurar Microsoft Entra ID

1. En **Microsoft Entra ID > Registros de aplicaciones**, crea o selecciona una aplicación de tipo SPA.
2. En **Autenticación > Plataforma: Single-page application**, añade exactamente estas dos URI de redirección:
	- `http://localhost:5173`
	- `http://127.0.0.1:5173`
	No las añadas como plataforma **Web** ni incluyas una barra final.
3. En **Exponer una API**, publica el scope `access_as_user` y concede ese permiso a la aplicación SPA.
4. Copia `.env.example` como `.env.local` y completa `VITE_ENTRA_TENANT_ID`, `VITE_ENTRA_CLIENT_ID` y `VITE_ENTRA_API_SCOPE`.
5. Asigna a las cuentas del personal uno de los roles exactos `Admin` o `Staff`.
6. Configura el mismo issuer, audience y scope en los cuatro microservicios.

## Configurar Amazon Cognito

Completa en `.env.local` la región, el User Pool, el cliente público y el dominio. El cliente debe usar Authorization Code con PKCE y aceptar `http://localhost:5173` como callback y cierre de sesión. Los microservicios deben recibir el mismo issuer y Client ID.

## Conectar los microservicios

Las URLs locales predeterminadas son:

- Jugadores: `http://localhost:8081`
- Torneos: `http://localhost:8082`
- Usuarios: `http://localhost:8083`
- Roster: `http://localhost:8084`

Se pueden cambiar con las variables `VITE_*_API_URL` de `.env.example`. Jugadores, torneos y roster ya alimentan las páginas públicas y las operaciones disponibles en el panel administrativo.

## Ejecutar

1. Inicia las bases de datos y los microservicios con sus variables de Entra ID y Cognito.
2. Instala las dependencias con `npm install`.
3. Arranca la aplicación con `npm run dev`.
4. Accede como fan con Cognito para comprobar la lectura y como personal con Entra ID para comprobar la edición.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
