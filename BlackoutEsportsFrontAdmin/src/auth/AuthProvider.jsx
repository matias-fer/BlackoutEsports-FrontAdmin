import { createContext, useContext } from 'react'
import { useMsal } from '@azure/msal-react'
import { ADMIN_ROLE, loginRequest } from '../authConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const account = accounts[0]
  const roles = account?.idTokenClaims?.roles || []
  const user = account ? {
    name: account.name || account.username,
    email: account.username,
    role: roles.includes(ADMIN_ROLE) ? 'admin' : 'user',
    source: 'entra',
  } : null

  const loginWithEntra = () => instance.loginRedirect(loginRequest)
  const logout = () => instance.logoutRedirect()

  return <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', loginWithEntra, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
