import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './Pages/Pages.css'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary'
import { AuthProvider } from './auth/AuthProvider'
import LocalAuthProvider from './auth/LocalAuthProvider'
import CognitoProvider from './auth/CognitoProvider'
import { cognitoConfig, cognitoIsConfigured, msalConfig } from './authConfig'
import { PlayersProvider } from './context/PlayersContext'
import { CompetitionProvider } from './context/CompetitionContext'

const isSecureOrigin = window.location.protocol === 'https:'
  || window.location.hostname === 'localhost'
  || window.location.hostname === '127.0.0.1'
const app = (
  <AppErrorBoundary>
    <PlayersProvider>
      <CompetitionProvider>
        <App />
      </CompetitionProvider>
    </PlayersProvider>
  </AppErrorBoundary>
)
const cognitoApp = <CognitoProvider>{app}</CognitoProvider>

async function startApp() {
  try {
    if (cognitoIsConfigured && isSecureOrigin) {
      const { Amplify } = await import('aws-amplify')
      Amplify.configure({
        Auth: {
          Cognito: {
            userPoolId: cognitoConfig.userPoolId,
            userPoolClientId: cognitoConfig.userPoolClientId,
            loginWith: {
              oauth: {
                domain: cognitoConfig.domain,
                scopes: ['openid', 'email', 'profile'],
                redirectSignIn: [cognitoConfig.redirectUri],
                redirectSignOut: [cognitoConfig.logoutUri],
                responseType: 'code',
              },
            },
          },
        },
      })
      createRoot(document.getElementById('root')).render(<StrictMode>{cognitoApp}</StrictMode>)
      return
    }

    if (isSecureOrigin) {
      const msalInstance = new PublicClientApplication(msalConfig)
      await msalInstance.initialize()
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <MsalProvider instance={msalInstance}>
            <AuthProvider>{app}</AuthProvider>
          </MsalProvider>
        </StrictMode>,
      )
      return
    }
  } catch {
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LocalAuthProvider>{app}</LocalAuthProvider>
    </StrictMode>,
  )
}

startApp()
