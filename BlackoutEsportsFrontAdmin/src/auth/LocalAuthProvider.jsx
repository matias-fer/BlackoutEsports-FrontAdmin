import { useState } from 'react'
import { AuthContext } from './AuthProvider'

const SESSION_KEY = 'blackout-esports-session'
const USERS_KEY = 'blackout-esports-users'

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

function LocalAuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(SESSION_KEY, null))

  const login = (email, password) => {
    const foundUser = readStorage(USERS_KEY, []).find((item) => item.email === email && item.password === password)
    if (!foundUser) return { error: 'Correo o contraseña incorrectos.' }
    const session = { name: foundUser.name, email: foundUser.email, role: foundUser.role || 'user' }
    saveStorage(SESSION_KEY, session)
    setUser(session)
    return { success: true }
  }

  const register = (name, email, password) => {
    const users = readStorage(USERS_KEY, [])
    if (users.some((item) => item.email === email)) return { error: 'Ya existe una cuenta con ese correo.' }
    saveStorage(USERS_KEY, [...users, { name, email, password, role: 'user' }])
    const session = { name, email, role: 'user' }
    saveStorage(SESSION_KEY, session)
    setUser(session)
    return { success: true }
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const getAccessToken = async () => null

  return <AuthContext.Provider value={{ user, isAdmin: user?.role === 'admin', login, register, logout, getAccessToken, loginWithEntra: () => ({ error: 'Entra ID requiere HTTPS.' }) }}>{children}</AuthContext.Provider>
}

export default LocalAuthProvider