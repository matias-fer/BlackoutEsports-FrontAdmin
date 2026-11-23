import { useEffect, useState } from 'react'
import { apiRequest } from '../../api/client'
import { useAuth } from '../../auth/AuthProvider'
import '../Admin/Admin.css'

const fields = [
  ['alias', 'Alias competitivo', 100], ['game', 'Videojuego', 100], ['role', 'Rol de juego', 100],
  ['rankName', 'Rango actual', 100], ['availability', 'Disponibilidad para entrenar', 250],
  ['motivation', '¿Por qué quieres entrar a la Academia?', 1500],
]
const decisions = { PENDING: 'Pendiente', ACCEPTED: 'Invitación a tryout', REJECTED: 'Rechazada' }
const delivery = { NONE: 'Sin decisión', PENDING: 'Pendiente de envío', SENT: 'Aceptado por el proveedor', FAILED: 'Fallido' }
const chile = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Santiago' })

function Application({ application, staff, save, busy }) {
  const [decision, setDecision] = useState('ACCEPTED')
  const a = application
  function submit(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const body = { decision }
    if (decision === 'ACCEPTED') {
      body.tryoutAt = new Date(values.get('date')).toISOString()
      body.location = values.get('location')
    }
    if (window.confirm(`¿Confirmar la decisión para ${a.alias}? Se programará un correo.`))
      save('/applications/' + a.id + '/decision', 'PUT', body)
  }
  return <article className="card bg-dark text-light border-secondary p-4 mb-3">
    <h3>{a.alias} · {a.game}</h3>
    <p><strong>{decisions[a.decision]}</strong> · {a.email}</p>
    <dl>{fields.slice(2).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{a[key]}</dd></div>)}</dl>
    {a.tryoutAt && <p>Tryout el {chile.format(new Date(a.tryoutAt))} (Santiago de Chile) · {a.location}</p>}
    {staff && <p>Estado del correo · {delivery[a.delivery]}</p>}
    {staff && a.decision === 'PENDING' && <form onSubmit={submit} className="d-grid gap-3">
      <label>Decisión<select className="form-select" value={decision} onChange={e => setDecision(e.target.value)}>
        <option value="ACCEPTED">Invitar a tryout</option><option value="REJECTED">Rechazar</option>
      </select></label>
      {decision === 'ACCEPTED' && <>
        <label>Fecha y hora del tryout ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          <input className="form-control" name="date" type="datetime-local" required /></label>
        <label>Lugar o enlace<input className="form-control" name="location" maxLength={500} required /></label>
      </>}
      <button className="btn btn-light" disabled={busy}>Confirmar decisión</button>
    </form>}
  </article>
}

function Workspace({ staff }) {
  const { getAccessToken } = useAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const [audit, setAudit] = useState(null)
  useEffect(() => {
    let active = true
    setError('')
    const path = staff ? '/applications' : '/me'
    getAccessToken().then(token => apiRequest('users', '/api/academy' + path, token))
      .then(data => { if (active) setRows(staff ? data : data ? [data] : []) })
      .catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [staff, getAccessToken, reload])
  async function save(path, method, body) {
    setBusy(true)
    setError('')
    try {
      const result = await apiRequest('users', '/api/academy' + path, await getAccessToken(), { method, body: JSON.stringify(body) })
      setRows(current => staff ? current.map(a => a.id === result.id ? result : a) : [result])
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  const visible = (rows || []).filter(a => !staff || filter === 'ALL' || a.decision === filter)
  async function loadAudit() {
    setBusy(true)
    setError('')
    try {
      setAudit(await apiRequest('users', '/api/academy/applications/audit', await getAccessToken()))
    } catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <>
    <div className="d-flex gap-3 align-items-center mb-3">
      <button className="btn btn-outline-light" disabled={busy} onClick={() => setReload(n => n + 1)}>Actualizar estado</button>
      {staff && <button className="btn btn-outline-light" disabled={busy} onClick={loadAudit}>Ver registro de decisiones</button>}
      {staff && <label>Mostrar <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="ALL">Todas las postulaciones</option><option value="PENDING">Pendientes</option>
      </select></label>}
    </div>
    {error && <p role="alert">{error}</p>}
    {staff && audit && <section className="card bg-dark text-light border-secondary p-3 mb-3" aria-label="Registro de decisiones">
      <h3>Registro de decisiones</h3>
      {!audit.length && <p>Todavía no hay decisiones registradas.</p>}
      <ul>{audit.map(entry => <li key={entry.applicationId}>
        {rows?.find(a => a.id === entry.applicationId)?.alias || 'Postulación archivada'} · {decisions[entry.decision]} · {chile.format(new Date(entry.decidedAt))}
      </li>)}</ul>
    </section>}
    {rows === null && !error && <p>Cargando postulaciones…</p>}
    {staff && rows && !visible.length && <p>No hay postulaciones para esta selección.</p>}
    {visible.map(a => <Application key={a.id} application={a} staff={staff} save={save} busy={busy} />)}
    {!staff && rows?.length === 0 && <form className="d-grid gap-3" onSubmit={e => {
      e.preventDefault()
      save('/me', 'POST', Object.fromEntries(new FormData(e.currentTarget)))
    }}>
      {fields.map(([key, label, max]) => <label key={key}>{label}
        {key === 'motivation' ? <textarea className="form-control" name={key} maxLength={max} required /> :
          <input className="form-control" name={key} maxLength={max} required />}
      </label>)}
      <button className="btn btn-light" disabled={busy}>Enviar postulación</button>
    </form>}
  </>
}

export default function Academy() {
  const { user, isAdmin, authLoading, loginWithCognito } = useAuth()
  return <section className="admin-page">
    <h2>Blackout Academy</h2>
    {authLoading ? <p>Cargando sesión…</p> : isAdmin || user?.source === 'cognito'
      ? <Workspace key={user.source + user.email} staff={isAdmin} />
      : <><p>Postula con tu cuenta de fan para participar en un tryout.</p>
        {!user && <button className="btn btn-light" onClick={loginWithCognito}>Ingresar con Cognito</button>}</>}
  </section>
}
