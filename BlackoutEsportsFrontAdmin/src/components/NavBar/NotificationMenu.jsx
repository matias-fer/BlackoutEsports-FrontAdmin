import { useCallback, useEffect, useState } from 'react'
import { notificationsApi } from '../../api/notifications'

function NotificationMenu({ getAccessToken, user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('loading')

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('No fue posible obtener la sesión.')
      setNotifications(await notificationsApi.list(token))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [getAccessToken, user])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  if (!user) return null

  return (
    <div className="site-navbar__notifications">
      <button
        aria-expanded={isOpen}
        aria-label={`Notificaciones${notifications.length ? `: ${notifications.length}` : ''}`}
        className="site-navbar__notification-button"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span aria-hidden="true">🔔</span>
        {notifications.length > 0 && <span className="site-navbar__notification-count">{notifications.length}</span>}
      </button>
      {isOpen && (
        <div className="site-navbar__notification-menu">
          <div className="site-navbar__notification-heading">
            <strong>Novedades</strong>
            <button onClick={loadNotifications} type="button">Actualizar</button>
          </div>
          {status === 'loading' && <p>Cargando notificaciones...</p>}
          {status === 'error' && <p>No fue posible cargar las notificaciones.</p>}
          {status === 'ready' && notifications.length === 0 && <p>Aún no hay novedades.</p>}
          {status === 'ready' && notifications.slice(0, 5).map((notification) => (
            <article className="site-navbar__notification" key={notification.id}>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationMenu
