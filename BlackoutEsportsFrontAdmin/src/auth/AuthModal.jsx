import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { entraIsConfigured } from '../authConfig'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const { loginWithEntra } = useAuth()
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  if (!isOpen) return null

  const signIn = async () => {
    setError('')
    setIsSigningIn(true)
    try {
      await loginWithEntra()
    } catch {
      setError('No se pudo iniciar sesión con Microsoft. Inténtalo nuevamente.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="auth-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-modal__panel" aria-labelledby="auth-title" role="dialog" aria-modal="true">
        <button className="auth-modal__close" onClick={onClose} type="button" aria-label="Cerrar">×</button>
        <p className="page-eyebrow">Blackout Esports</p>
        <h2 id="auth-title">Bienvenido de vuelta</h2>
        <p className="auth-modal__intro">Inicia sesión con tu cuenta de Microsoft para acceder.</p>
        {error && <p className="auth-modal__error" role="alert">{error}</p>}
        {entraIsConfigured ? (
          <button className="auth-modal__entra" onClick={signIn} disabled={isSigningIn} type="button">
            {isSigningIn ? 'Conectando con Microsoft…' : 'Iniciar sesión con Microsoft Entra ID'}
          </button>
        ) : (
          <p className="auth-modal__error" role="alert">El inicio de sesión no está disponible. Contacta al administrador.</p>
        )}
        <p className="auth-modal__note">El panel de administración está disponible para cuentas con rol de administrador.</p>
      </section>
    </div>
  )
}

export default AuthModal
