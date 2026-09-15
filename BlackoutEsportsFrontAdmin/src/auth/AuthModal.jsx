import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { cognitoIsConfigured, entraIsConfigured } from '../authConfig'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithEntra, loginWithCognito } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const canUseEntra = window.location.protocol === 'https:'
    || window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
  const canUseCognito = canUseEntra

  if (!isOpen) return null

  const isRegistering = mode === 'register'
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const result = isRegistering
      ? register(form.name.trim(), form.email.trim().toLowerCase(), form.password)
      : login(form.email.trim().toLowerCase(), form.password)

    if (result.error) {
      setError(result.error)
      return
    }

    setForm({ name: '', email: '', password: '' })
    setError('')
    onClose()
  }

  return (
    <div className="auth-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-modal__panel" aria-labelledby="auth-title" role="dialog" aria-modal="true">
        <button className="auth-modal__close" onClick={onClose} type="button" aria-label="Cerrar">×</button>
        <p className="page-eyebrow">Blackout Esports</p>
        <h2 id="auth-title">{isRegistering ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}</h2>
        <p className="auth-modal__intro">Acceso visual para explorar la comunidad y el panel.</p>
        <div className="auth-modal__tabs" role="tablist" aria-label="Tipo de acceso">
          <button className={!isRegistering ? 'is-active' : ''} onClick={() => changeMode('login')} type="button">Iniciar sesión</button>
          <button className={isRegistering ? 'is-active' : ''} onClick={() => changeMode('register')} type="button">Registrarse</button>
        </div>
        <form className="auth-modal__form" onSubmit={submit}>
          {isRegistering && (
            <label>
              <span>Nombre</span>
              <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Tu nombre" />
            </label>
          )}
          <label>
            <span>Correo electrónico</span>
            <input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="nombre@gmail.com" />
          </label>
          <label>
            <span>Contraseña</span>
            <input required minLength="8" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Mínimo 8 caracteres" />
          </label>
          {error && <p className="auth-modal__error" role="alert">{error}</p>}
          <button className="auth-modal__submit" type="submit">{isRegistering ? 'Crear cuenta' : 'Entrar'}</button>
        </form>
        {entraIsConfigured && canUseEntra && (
          <>
            <div className="auth-modal__divider"><span>o</span></div>
            <button className="auth-modal__entra" onClick={loginWithEntra} type="button">Entrar con Entra ID</button>
          </>
        )}
        {cognitoIsConfigured && canUseCognito && (
          <>
            <div className="auth-modal__divider"><span>o</span></div>
            <button className="auth-modal__entra" onClick={loginWithCognito} type="button">Entrar con Amazon Cognito</button>
          </>
        )}
        <p className="auth-modal__note">Tus datos se guardan únicamente en este navegador.</p>
      </section>
    </div>
  )
}

export default AuthModal
