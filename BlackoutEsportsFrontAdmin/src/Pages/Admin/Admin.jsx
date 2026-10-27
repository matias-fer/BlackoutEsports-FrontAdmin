import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { useCompetition } from '../../context/CompetitionContext'
import { usePlayers } from '../../context/PlayersContext'
import './Admin.css'

const editableFields = [
  ['alias', 'Alias'],
  ['name', 'Nombre'],
  ['team', 'Equipo'],
  ['game', 'Juego'],
  ['role', 'Rol'],
  ['country', 'País'],
  ['sensitivity', 'Sensibilidad'],
]
const tournamentFields = [
  ['name', 'Nombre'],
  ['game', 'Juego'],
  ['status', 'Estado'],
  ['date', 'Fecha'],
  ['teams', 'Equipos'],
]
const teamFields = [
  ['name', 'Nombre'],
  ['game', 'Juego'],
  ['label', 'Descripción'],
  ['number', 'Número'],
  ['status', 'Estado'],
]

const peripheralFields = [
  ['type', 'Tipo'],
  ['name', 'Nombre'],
  ['specs', 'Especificaciones'],
  ['search', 'Búsqueda'],
]

const emptyPeripheral = { type: '', name: '', specs: '', search: '' }
const emptyPlayer = {
  alias: '', name: '', team: '', game: '', role: '', country: '', sensitivity: '',
  mouse: '', keyboard: '', headset: '', monitor: '',
  peripherals: [emptyPeripheral, emptyPeripheral, emptyPeripheral, emptyPeripheral],
}
const emptyTournament = { name: '', game: '', status: '', date: '', teams: '' }
const emptyTeam = {
  name: '', game: '', label: '', number: '', status: '', playerIds: [],
}


function Admin() {
  const { user, isAdmin, authError } = useAuth()
  const playerContext = usePlayers()
  const competition = useCompetition()
  const { players, playersError } = playerContext
  const { tournaments, teams, competitionError } = competition
  const [section, setSection] = useState('players')
  const [mode, setMode] = useState('create')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [forms, setForms] = useState({})
  const [drafts, setDrafts] = useState({})
  const [notice, setNotice] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const busy = useRef(false)
  const dialog = useRef(null)
  const settings = {
    players: { label: 'Jugadores', singular: 'jugador', records: players, fields: editableFields, empty: emptyPlayer,
      create: playerContext.addPlayer, update: playerContext.updatePlayer, remove: playerContext.deletePlayer },
    tournaments: { label: 'Torneos', singular: 'torneo', records: tournaments, fields: tournamentFields, empty: emptyTournament,
      create: competition.addTournament, update: competition.updateTournament, remove: competition.deleteTournament },
    roster: { label: 'Rosters', singular: 'roster', records: teams, fields: teamFields, empty: emptyTeam,
      create: competition.addTeam, update: competition.updateTeam, remove: competition.deleteTeam },
  }
  const config = settings[section]
  const value = mode === 'create' ? (forms[section] || config.empty) : drafts[section]
  const setValue = (update) => {
    const setter = mode === 'create' ? setForms : setDrafts
    setter(current => ({ ...current, [section]: update(current[section] || config.empty) }))
  }
  useEffect(() => {
    if (confirmation && !dialog.current.open) dialog.current.showModal()
  }, [confirmation])
  const cancel = () => {
    if (busy.current) return
    dialog.current.close()
    setConfirmation(null)
  }
  const requestOperation = (action) => {
    if (!value || busy.current) return
    if (action === 'create' && section === 'players' && players.some(p => p.alias.toLowerCase() === value.alias.trim().toLowerCase())) {
      setNotice({ error: true, text: 'Ese alias ya existe.' })
      return
    }
    const name = value.alias || value.name
    const verb = { create: 'Crear', update: 'Guardar cambios en', remove: 'Eliminar' }[action]
    setConfirmation({ action, section, config, value, name, title: verb + ' ' + config.singular })
  }
  const confirm = async () => {
    if (busy.current || !confirmation) return
    busy.current = true
    setIsSaving(true)
    setNotice(null)
    const { action, section: target, config: targetConfig, value: data, name } = confirmation
    try {
      let payload = data
      if (action === 'create' && target === 'players') payload = { ...data, alias: data.alias.trim(), name: data.name.trim(), team: data.team.trim() }
      await targetConfig[action](action === 'remove' ? data.id : payload)
      if (action === 'create') setForms(current => ({ ...current, [target]: structuredClone(targetConfig.empty) }))
      else setDrafts(current => ({ ...current, [target]: null }))
      setNotice({ error: false, text: name + ': ' + ({ create: 'creado', update: 'actualizado', remove: 'eliminado' }[action]) + ' correctamente.' })
    } catch (error) {
      setNotice({ error: true, text: error.message || 'No fue posible completar la operación. Tus datos se conservaron.' })
    } finally {
      busy.current = false
      setIsSaving(false)
      dialog.current.close()
      setConfirmation(null)
    }
  }
  if (!user) return <AccessMessage title="Acceso restringido" copy="Inicia sesión desde el botón superior para continuar." />
  if (!isAdmin) return <AccessMessage title="Solo administradores" copy="El panel está reservado para cuentas con permisos de administración." />
  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div><p className="page-eyebrow">Administración</p><h2>Panel de administración</h2></div>
        <span className="admin-page__account">{user.email}</span>
      </div>
      {(authError || playersError || competitionError) && <p role="alert" className="admin-editor__error">{[authError, playersError, competitionError].filter(Boolean).join(' ')}</p>}
      {notice && <p role={notice.error ? 'alert' : 'status'} className={notice.error ? 'admin-editor__error' : 'admin-feedback'}>{notice.text}</p>}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button type="button" className="admin-menu-toggle" aria-expanded={mobileMenu} aria-controls="admin-sections" onClick={() => setMobileMenu(!mobileMenu)}>Secciones · {config.label}</button>
          <nav id="admin-sections" aria-label="Secciones de administración" className={mobileMenu ? 'is-open' : ''}>
            {Object.entries(settings).map(([key, item]) => <button key={key} type="button" aria-current={section === key ? 'page' : undefined} onClick={() => { setSection(key); setMobileMenu(false); setNotice(null) }}>
              <span>{item.label}</span><small>{item.records.length}</small>
            </button>)}
          </nav>
        </aside>
        <div className="admin-content">
          <h3>{config.label}</h3>
          <div className="admin-modes" aria-label="Acciones de administración">
            <button type="button" aria-pressed={mode === 'create'} onClick={() => { setMode('create'); setNotice(null) }}>Crear</button>
            <button type="button" aria-pressed={mode === 'manage'} onClick={() => { setMode('manage'); setNotice(null) }}>Administrar</button>
          </div>
          {mode === 'manage' && <label className="admin-selector">Seleccionar {config.singular}
            <select value={drafts[section]?.id ?? ''} onChange={event => {
              const record = config.records.find(item => String(item.id) === event.target.value)
              setDrafts(current => ({ ...current, [section]: record ? structuredClone(record) : null }))
              setNotice(null)
            }}>
              <option value="">Selecciona un registro</option>
              {config.records.map(item => <option key={item.id} value={item.id}>{item.alias || item.name}</option>)}
            </select>
          </label>}
          {value ? <form className="admin-editor__form admin-editor__form--standalone" onSubmit={event => { event.preventDefault(); requestOperation(mode === 'create' ? 'create' : 'update') }}>
            <h4>{mode === 'create' ? 'Crear' : 'Editar'} {config.singular}</h4>
            <div className="admin-editor__grid">
              {config.fields.map(([field, label]) => <label key={field}><span>{label}</span>
                <input required={section === 'tournaments' || (section === 'roster' ? ['name', 'game'].includes(field) : (mode === 'manage' || ['alias', 'name', 'team', 'game', 'role', 'country'].includes(field)))}
                  value={value[field] ?? ''} onChange={event => setValue(current => ({ ...current, [field]: event.target.value }))} />
              </label>)}
            </div>
            {section === 'players' && <PeripheralFields peripherals={value.peripherals} onChange={(index, field, text) => setValue(current => ({ ...current, peripherals: (current.peripherals || []).map((item, i) => i === index ? { ...item, [field]: text } : item) }))} />}
            {section === 'roster' && <RosterPlayers players={players} selectedIds={value.playerIds} onToggle={id => setValue(current => {
              const selected = (current.playerIds || []).map(String)
              return { ...current, playerIds: selected.includes(String(id)) ? selected.filter(item => item !== String(id)) : [...selected, String(id)] }
            })} />}
            <div className="admin-editor__actions">
              <button className="admin-editor__save" type="submit" disabled={isSaving}>{mode === 'create' ? 'Crear ' + config.singular : 'Guardar cambios'}</button>
              {mode === 'manage' && <button className="admin-editor__delete" type="button" disabled={isSaving} onClick={() => requestOperation('remove')}>Eliminar {config.singular}</button>}
            </div>
          </form> : <p className="admin-section__empty">{config.records.length ? 'Selecciona un registro para editarlo o eliminarlo.' : 'Todavía no hay registros en esta sección.'}</p>}
        </div>
      </div>
      <dialog className="admin-confirm" ref={dialog} aria-labelledby="admin-confirm-title" onCancel={event => { event.preventDefault(); cancel() }}>
        {confirmation && <>
          <h3 id="admin-confirm-title">{confirmation.title}</h3>
          <p>¿Confirmas esta operación para <strong>{confirmation.name}</strong>?</p>
          {confirmation.action === 'remove' && <p>Esta acción no se puede deshacer.</p>}
          <div className="admin-editor__actions">
            <button autoFocus className="admin-editor__delete" type="button" disabled={isSaving} onClick={cancel}>Cancelar</button>
            <button className="admin-editor__save" type="button" disabled={isSaving} onClick={confirm}>{isSaving ? 'Guardando…' : 'Confirmar'}</button>
          </div>
        </>}
      </dialog>
    </section>
  )
}

function PeripheralFields({ peripherals = [], onChange }) {
  return (
    <div className="admin-peripherals">
      <p className="admin-peripherals__title">Periféricos</p>
      {peripherals.map((peripheral, index) => (
        <fieldset className="admin-peripheral" key={index}>
          <legend>Periférico {index + 1}</legend>
          <div className="admin-editor__grid">
            {peripheralFields.map(([field, label]) => (
              <label key={field}>
                <span>{label}</span>
                <input required={field !== 'search'} value={peripheral[field] || ''} onChange={(event) => onChange(index, field, event.target.value)} />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

function RosterPlayers({ players, selectedIds = [], onToggle }) {
  return (
    <fieldset className="admin-roster-players">
      <legend>Jugadores de la alineación</legend>
      {players.length > 0 ? (
        <div className="admin-roster-players__grid">
          {players.map((player) => (
            <label key={player.id || player.alias}>
              <input
                checked={selectedIds.map(String).includes(String(player.id))}
                disabled={!player.id}
                onChange={() => onToggle(player.id)}
                type="checkbox"
              />
              <span><strong>{player.alias}</strong> · {player.role}</span>
            </label>
          ))}
        </div>
      ) : <p>No hay jugadores disponibles.</p>}
    </fieldset>
  )
}

function AccessMessage({ title, copy, action }) {
  return (
    <section className="admin-page admin-page--message">
      <p className="page-eyebrow">Administración</p>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action && <button className="admin-editor__save" onClick={action} type="button">Iniciar sesión</button>}
    </section>
  )
}

export default Admin
