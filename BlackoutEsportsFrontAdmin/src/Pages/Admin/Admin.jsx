import { useEffect, useState } from 'react'
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
  alias: '', name: '', team: '', game: 'Valorant', role: '', country: '', sensitivity: '',
  mouse: '', keyboard: '', headset: '', monitor: '',
  peripherals: [emptyPeripheral, emptyPeripheral, emptyPeripheral, emptyPeripheral],
}

function Admin() {
  const { user, isAdmin, authError } = useAuth()
  const { players, playersError, addPlayer, updatePlayer, deletePlayer } = usePlayers()
  const { tournaments, teams, competitionError, updateTournament, updateTeam } = useCompetition()
  const [selectedAlias, setSelectedAlias] = useState(players[0]?.alias || '')
  const selectedPlayer = players.find((player) => player.alias === selectedAlias)
  const [draft, setDraft] = useState(selectedPlayer)
  const [newPlayer, setNewPlayer] = useState(emptyPlayer)
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.name || '')
  const [tournamentDraft, setTournamentDraft] = useState(tournaments[0])
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.name || '')
  const [teamDraft, setTeamDraft] = useState(teams[0])
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const nextPlayer = players.find((player) => player.alias === selectedAlias) || players[0]
    setSelectedAlias(nextPlayer?.alias || '')
    setDraft(nextPlayer)
  }, [players, selectedAlias])

  useEffect(() => {
    const nextTournament = tournaments.find((item) => item.id === tournamentDraft?.id) || tournaments[0]
    setSelectedTournament(nextTournament?.id || '')
    setTournamentDraft(nextTournament)
  }, [tournaments, tournamentDraft?.id])

  useEffect(() => {
    const nextTeam = teams.find((item) => item.id === teamDraft?.id) || teams[0]
    setSelectedTeam(nextTeam?.id || '')
    setTeamDraft(nextTeam)
  }, [teams, teamDraft?.id])

  const selectPlayer = (alias) => {
    setSelectedAlias(alias)
    setDraft(players.find((player) => player.alias === alias))
    setMessage('')
  }

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }))
  const updateNewPlayer = (field, value) => setNewPlayer((current) => ({ ...current, [field]: value }))
  const updatePeripheral = (index, field, value) => setDraft((current) => ({
    ...current,
    peripherals: current.peripherals.map((peripheral, peripheralIndex) => (
      peripheralIndex === index ? { ...peripheral, [field]: value } : peripheral
    )),
  }))
  const updateNewPeripheral = (index, field, value) => setNewPlayer((current) => ({
    ...current,
    peripherals: current.peripherals.map((peripheral, peripheralIndex) => (
      peripheralIndex === index ? { ...peripheral, [field]: value } : peripheral
    )),
  }))

  const runOperation = async (operation, successMessage) => {
    setIsSaving(true)
    setMessage('')
    try {
      const result = await operation()
      setMessage(successMessage)
      return { ok: true, value: result }
    } catch (error) {
      setMessage(error.message || 'No fue posible completar la operación.')
      return { ok: false, value: null }
    } finally {
      setIsSaving(false)
    }
  }

  const saveDraft = async (event) => {
    event.preventDefault()
    const result = await runOperation(() => updatePlayer(draft), 'Jugador actualizado en el microservicio.')
    if (result.ok) {
      setSelectedAlias(result.value.alias)
      setDraft(result.value)
    }
  }

  const removePlayer = async () => {
    if (!draft || !window.confirm(`¿Eliminar a ${draft.alias}? Esta acción no se puede deshacer.`)) return

    const result = await runOperation(() => deletePlayer(draft.id), 'Jugador eliminado del microservicio.')
    if (result.ok) {
      const nextPlayer = players.find((player) => player.id !== draft.id)
      setSelectedAlias(nextPlayer?.alias || '')
      setDraft(nextPlayer)
    }
  }

  const saveNewPlayer = async (event) => {
    event.preventDefault()
    if (players.some((player) => player.alias.toLowerCase() === newPlayer.alias.trim().toLowerCase())) {
      setMessage('Ese alias ya existe.')
      return
    }
    const result = await runOperation(
      () => addPlayer({ ...newPlayer, alias: newPlayer.alias.trim(), name: newPlayer.name.trim(), team: newPlayer.team.trim() }),
      'Jugador creado en el microservicio.',
    )
    if (result.ok) setNewPlayer(emptyPlayer)
  }

  const saveTournament = async (event) => {
    event.preventDefault()
    const result = await runOperation(() => updateTournament(tournamentDraft), 'Torneo actualizado en el microservicio.')
    if (result.ok) {
      setSelectedTournament(result.value.id)
      setTournamentDraft(result.value)
    }
  }

  const saveTeam = async (event) => {
    event.preventDefault()
    const result = await runOperation(() => updateTeam(teamDraft), 'Roster actualizado en el microservicio.')
    if (result.ok) {
      setSelectedTeam(result.value.id)
      setTeamDraft(result.value)
    }
  }

  if (!user) {
    return <AccessMessage title="Acceso restringido" copy="Inicia sesión desde el botón superior para continuar." />
  }

  if (!isAdmin) {
    return <AccessMessage title="Solo administradores" copy="Tu cuenta tiene acceso como usuario común. El panel de administración está reservado para cuentas admin." />
  }

  return (
    <section className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p className="page-eyebrow">Administración</p>
          <h2>Editar jugadores</h2>
          <p>Actualiza los datos visibles del roster sin tocar el código.</p>
        </div>
        <span className="admin-page__account">{user.email}</span>
      </div>
      {(authError || playersError || competitionError) && (
        <p className="admin-editor__error" role="alert">{[authError, playersError, competitionError].filter(Boolean).join(' ')}</p>
      )}
      <div className="admin-editor">
        <nav className="admin-editor__players" aria-label="Seleccionar jugador">
          {players.map((player) => (
            <button className={player.alias === selectedAlias ? 'is-selected' : ''} key={player.alias} onClick={() => selectPlayer(player.alias)} type="button">
              <strong>{player.alias}</strong><span>{player.team}</span>
            </button>
          ))}
        </nav>
        {draft && (
          <form className="admin-editor__form" onSubmit={saveDraft}>
            <div className="admin-editor__grid">
              {editableFields.map(([field, label]) => (
                <label key={field}>
                  <span>{label}</span>
                  <input required value={draft[field] || ''} onChange={(event) => updateDraft(field, event.target.value)} />
                </label>
              ))}
            </div>
            <PeripheralFields peripherals={draft.peripherals} onChange={updatePeripheral} />
            <div className="admin-editor__actions">
              <button className="admin-editor__save" disabled={isSaving} type="submit">Guardar cambios</button>
              <button className="admin-editor__delete" disabled={isSaving} onClick={removePlayer} type="button">Eliminar jugador</button>
            </div>
            {message && <p className="admin-editor__message" role="status">{message}</p>}
          </form>
        )}
      </div>
      <section className="admin-section">
        <div className="admin-section__heading">
          <div><p className="page-eyebrow">Nuevos integrantes</p><h3>Agregar jugador</h3></div>
        </div>
        <form className="admin-editor__form admin-editor__form--standalone" onSubmit={saveNewPlayer}>
          <div className="admin-editor__grid">
            {editableFields.map(([field, label]) => (
              <label key={field}>
                <span>{label}</span>
                <input required={['alias', 'name', 'team', 'role', 'country'].includes(field)} value={newPlayer[field] || ''} onChange={(event) => updateNewPlayer(field, event.target.value)} />
              </label>
            ))}
          </div>
          <PeripheralFields peripherals={newPlayer.peripherals} onChange={updateNewPeripheral} />
          <button className="admin-editor__save" disabled={isSaving} type="submit">Agregar jugador</button>
        </form>
      </section>
      <section className="admin-section">
        <div className="admin-section__heading">
          <div><p className="page-eyebrow">Calendario competitivo</p><h3>Modificar torneo</h3></div>
          <select value={selectedTournament} onChange={(event) => { const id = Number(event.target.value); setSelectedTournament(id); setTournamentDraft(tournaments.find((item) => item.id === id)) }}>
            {tournaments.map((tournament) => <option key={tournament.id || tournament.name} value={tournament.id || ''}>{tournament.name}</option>)}
          </select>
        </div>
        <form className="admin-editor__form admin-editor__form--standalone" onSubmit={saveTournament}>
          <div className="admin-editor__grid">
            {tournamentFields.map(([field, label]) => <label key={field}><span>{label}</span><input required value={tournamentDraft?.[field] || ''} onChange={(event) => setTournamentDraft((current) => ({ ...current, [field]: event.target.value }))} /></label>)}
          </div>
          <button className="admin-editor__save" disabled={isSaving || !tournamentDraft?.id} type="submit">Guardar torneo</button>
        </form>
      </section>
      <section className="admin-section">
        <div className="admin-section__heading">
          <div><p className="page-eyebrow">Alineaciones</p><h3>Modificar roster</h3></div>
          <select value={selectedTeam} onChange={(event) => { const id = Number(event.target.value); setSelectedTeam(id); setTeamDraft(teams.find((item) => item.id === id)) }}>
            {teams.map((team) => <option key={team.id || team.name} value={team.id || ''}>{team.name}</option>)}
          </select>
        </div>
        <form className="admin-editor__form admin-editor__form--standalone" onSubmit={saveTeam}>
          <div className="admin-editor__grid">
            {teamFields.map(([field, label]) => <label key={field}><span>{label}</span><input value={teamDraft?.[field] || ''} onChange={(event) => setTeamDraft((current) => ({ ...current, [field]: event.target.value }))} /></label>)}
          </div>
          <button className="admin-editor__save" disabled={isSaving || !teamDraft?.id} type="submit">Guardar roster</button>
        </form>
      </section>
    </section>
  )
}

function PeripheralFields({ peripherals = [], onChange }) {
  return (
    <div className="admin-peripherals">
      <p className="admin-peripherals__title">Periféricos</p>
      {peripherals.map((peripheral, index) => (
        <fieldset className="admin-peripheral" key={`${peripheral.type}-${index}`}>
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
