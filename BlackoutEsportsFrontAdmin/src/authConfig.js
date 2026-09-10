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
