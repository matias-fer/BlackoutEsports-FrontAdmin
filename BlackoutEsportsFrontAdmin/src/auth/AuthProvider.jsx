import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth'
import {
  ADMIN_ROLE,
  STAFF_ROLE,
  cognitoIsConfigured,
  entraIsConfigured,
  loginRequest,
} from '../authConfig'

export const AuthContext = createContext(null)

function readTokenClaims(accessToken) {
  try {
    const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(atob(payload).split('').map((character) => (
      `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`
    )).join('')))
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const [entraUser, setEntraUser] = useState(null)
  const [cognitoUser, setCognitoUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const account = accounts[0]
    let active = true

    if (!account || !entraIsConfigured) {
      setEntraUser(null)
      return () => { active = false }
    }

    setAuthLoading(true)
    instance.acquireTokenSilent({ ...loginRequest, account })
      .then((response) => {
        if (!active) return
        const claims = readTokenClaims(response.accessToken)
        const roles = Array.isArray(claims.roles) ? claims.roles : []
        setEntraUser({
          name: account.name || account.username,
          email: account.username,
          roles,
          source: 'entra',
        })
        setAuthError('')
      })
      .catch(() => {
        if (!active) return
        setEntraUser({
          name: account.name || account.username,
          email: account.username,
          roles: [],
          source: 'entra',
        })
        setAuthError('No fue posible obtener el access token de la API. Revisa el scope configurado en Entra ID.')
      })
      .finally(() => active && setAuthLoading(false))

    return () => { active = false }
  }, [accounts, instance])

  useEffect(() => {
    let active = true

    if (!cognitoIsConfigured) {
      setAuthLoading(false)
      return () => { active = false }
    }

    getCurrentUser()
      .then(async (currentUser) => {
        const session = await fetchAuthSession()
        if (!active) return
        const claims = session.tokens?.idToken?.payload || {}
        setCognitoUser({
          name: claims.name || claims.email || currentUser.username,
          email: claims.email || currentUser.signInDetails?.loginId || currentUser.username,
          roles: [],
          source: 'cognito',
        })
      })
      .catch(() => active && setCognitoUser(null))
      .finally(() => active && setAuthLoading(false))

    return () => { active = false }
  }, [])

  const user = entraUser || cognitoUser
  const isAdmin = user?.source === 'entra'
    && user.roles.some((role) => role === ADMIN_ROLE || role === STAFF_ROLE)

  const loginWithEntra = useCallback(() => {
    if (!entraIsConfigured) throw new Error('Falta configurar Entra ID y el scope de la API.')
    return instance.loginRedirect(loginRequest)
  }, [instance])

  const loginWithCognito = useCallback(() => {
    if (!cognitoIsConfigured) throw new Error('Falta configurar Amazon Cognito.')
    return signInWithRedirect()
  }, [])

  const logout = useCallback(async () => {
    if (user?.source === 'entra') {
      await instance.logoutRedirect({ account: accounts[0] })
      return
    }
    if (user?.source === 'cognito') await signOut({ global: true })
  }, [accounts, instance, user?.source])

  const getAccessToken = useCallback(async () => {
    if (user?.source === 'entra') {
      const account = accounts[0]
      if (!account) return null
      const response = await instance.acquireTokenSilent({ ...loginRequest, account })
      return response.accessToken
    }
    if (user?.source === 'cognito') {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() || null
    }
    return null
  }, [accounts, instance, user?.source])

  const value = useMemo(() => ({
    user,
    isAdmin,
    authLoading,
    authError,
    loginWithEntra,
    loginWithCognito,
    logout,
    getAccessToken,
  }), [authError, authLoading, getAccessToken, isAdmin, loginWithCognito, loginWithEntra, logout, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
