const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID
const authority = import.meta.env.VITE_ENTRA_AUTHORITY || `https://login.microsoftonline.com/${tenantId || 'common'}`
const redirectUri = import.meta.env.VITE_ENTRA_REDIRECT_URI || 'http://localhost:5173'

export const entraIsConfigured = Boolean(tenantId && clientId)

export const msalConfig = {
  auth: {
    clientId: clientId || '00000000-0000-0000-0000-000000000000',
    authority,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
}

export const ADMIN_ROLE = 'Admin'

export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || redirectUri,
  logoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI || redirectUri,
  region: import.meta.env.VITE_AWS_REGION,
}

export const cognitoIsConfigured = Boolean(
  cognitoConfig.userPoolId
  && cognitoConfig.userPoolClientId
  && cognitoConfig.domain
  && cognitoConfig.region,
)
