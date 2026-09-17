import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { cognitoIsConfigured, entraIsConfigured } from '../authConfig'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const { loginWithEntra, loginWithCognito } = useAuth()
  const [error, setError] = useState('')
  const canUseEntra = window.location.protocol === 'https:'
    || window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
  const canUseCognito = canUseEntra

  if (!isOpen) return null

  const startLogin = async (loginAction) => {
    setError('')
    try {
      await loginAction()
    } catch (loginError) {
      setError(loginError.message || 'No fue posible iniciar sesión.')
    }
  }

  return (
    <div className="auth-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-modal__panel" aria-labelledby="auth-title" role="dialog" aria-modal="true">
        <button className="auth-modal__close" onClick={onClose} type="button" aria-label="Cerrar">×</button>
        <p className="page-eyebrow">Blackout Esports</p>
        <h2 id="auth-title">Elige tu acceso</h2>
        <p className="auth-modal__intro">El personal administra con Entra ID. Los fans acceden en modo lectura con Cognito.</p>
        {entraIsConfigured && canUseEntra && (
          <button className="auth-modal__entra" onClick={() => startLogin(loginWithEntra)} type="button">Personal: entrar con Entra ID</button>
        )}
        {cognitoIsConfigured && canUseCognito && (
          <>
            <div className="auth-modal__divider"><span>o</span></div>
            <button className="auth-modal__entra" onClick={() => startLogin(loginWithCognito)} type="button">Fans: entrar o registrarse con Cognito</button>
          </>
        )}
        {error && <p className="auth-modal__error" role="alert">{error}</p>}
        {!entraIsConfigured && !cognitoIsConfigured && <p className="auth-modal__error">Falta configurar los proveedores de acceso.</p>}
        <p className="auth-modal__note">Los permisos de edición se validan nuevamente en cada microservicio.</p>
      </section>
    </div>
  )
}

export default AuthModal
