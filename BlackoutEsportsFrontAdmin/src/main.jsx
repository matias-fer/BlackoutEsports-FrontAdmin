import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import './Pages/Pages.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import { msalConfig } from './authConfig'
import { PlayersProvider } from './context/PlayersContext'
import { CompetitionProvider } from './context/CompetitionContext'

const msalInstance = new PublicClientApplication(msalConfig)

await msalInstance.initialize()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <PlayersProvider>
          <CompetitionProvider>
            <App />
          </CompetitionProvider>
        </PlayersProvider>
      </AuthProvider>
    </MsalProvider>
  </StrictMode>,
)
