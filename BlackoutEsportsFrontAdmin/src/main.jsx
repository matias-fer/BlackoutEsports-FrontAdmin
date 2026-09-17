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
import { cognitoConfig, cognitoIsConfigured, msalConfig } from './authConfig'
import { PlayersProvider } from './context/PlayersContext'
import { CompetitionProvider } from './context/CompetitionContext'

const isSecureOrigin = window.location.protocol === 'https:'
  || window.location.hostname === 'localhost'
  || window.location.hostname === '127.0.0.1'
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
                scopes: ['openid', 'email'],
                redirectSignIn: [cognitoConfig.redirectUri],
                redirectSignOut: [cognitoConfig.logoutUri],
                responseType: 'code',
              },
            },
          },
        },
      })
    }

    if (isSecureOrigin) {
      const msalInstance = new PublicClientApplication(msalConfig)
      await msalInstance.initialize()
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <MsalProvider instance={msalInstance}>
            <AuthProvider>
              <AppErrorBoundary>
                <PlayersProvider>
                  <CompetitionProvider>
                    <App />
                  </CompetitionProvider>
                </PlayersProvider>
              </AppErrorBoundary>
            </AuthProvider>
          </MsalProvider>
        </StrictMode>,
      )
      return
    }
  } catch {
  }

  createRoot(document.getElementById('root')).render(<AppErrorBoundary><p>La autenticación requiere HTTPS o localhost.</p></AppErrorBoundary>)
}

startApp()
