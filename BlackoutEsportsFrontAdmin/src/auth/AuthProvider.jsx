import { createContext, useContext, useEffect, useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { ADMIN_ROLE, loginRequest } from '../authConfig'

const SESSION_KEY = 'blackout-esports-session'
const USERS_KEY = 'blackout-esports-users'
const AuthContext = createContext(null)

function normalizeUser(user) {
  return user ? {
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'user',
    source: user.source || 'local',
  } : null
}

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal()
  const [user, setUser] = useState(() => normalizeUser(readStorage(SESSION_KEY, null)))

  useEffect(() => {
    const account = accounts[0]
    if (!account) return

    const roles = account.idTokenClaims?.roles || []
    const entraUser = normalizeUser({
      name: account.name || account.username,
      email: account.username,
      role: roles.includes(ADMIN_ROLE) ? 'admin' : 'user',
      source: 'entra',
    })
    setUser(entraUser)
  }, [accounts])

  const login = (email, password) => {
    const users = readStorage(USERS_KEY, [])
    const foundUser = users.find((item) => item.email === email && item.password === password)

    if (!foundUser) return { error: 'Correo o contraseña incorrectos.' }

    const session = normalizeUser({ ...foundUser, source: 'local' })
    saveStorage(SESSION_KEY, session)
    setUser(session)
    return { success: true }
  }

  const register = (name, email, password) => {
    const users = readStorage(USERS_KEY, [])
    if (users.some((item) => item.email === email)) {
      return { error: 'Ya existe una cuenta con ese correo.' }
    }

    saveStorage(USERS_KEY, [...users, { name, email, password, role: 'user' }])
    const session = { name, email, role: 'user' }
    saveStorage(SESSION_KEY, session)
    setUser(session)
    return { success: true }
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
    if (accounts.length > 0) {
      instance.logoutRedirect()
    }
  }

  const loginWithEntra = () => instance.loginRedirect(loginRequest)

  return <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, register, loginWithEntra, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
