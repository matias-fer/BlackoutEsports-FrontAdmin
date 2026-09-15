import { useEffect, useState } from 'react'
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth'
import { AuthContext } from './AuthProvider'
import { cognitoConfig } from '../authConfig'

function CognitoProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then(async (currentUser) => {
        const session = await fetchAuthSession()
        if (!active) return
        const groups = session.tokens?.accessToken?.payload?.['cognito:groups'] || []
        setUser({
          name: currentUser.username,
          email: currentUser.signInDetails?.loginId || currentUser.username,
          role: groups.includes('admin') ? 'admin' : 'user',
          source: 'cognito',
        })
      })
      .catch(() => {
        if (active) setUser(null)
      })

    return () => { active = false }
  }, [])

  const loginWithCognito = () => signInWithRedirect({ provider: 'COGNITO' })
  const logout = () => signOut({ global: true })
  const login = () => ({ error: 'Usa el acceso de Cognito.' })
  const register = () => ({ error: 'Usa el registro de Cognito.' })
  const getAccessToken = async () => {
    const session = await fetchAuthSession()
    return session.tokens?.accessToken?.toString() || null
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      loginWithCognito,
      getAccessToken,
      cognitoLogoutUri: cognitoConfig.logoutUri,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default CognitoProvider