import { useState } from 'react'
import { useCompetition } from '../../context/CompetitionContext'

const fields = [['name', 'Nombre', 120], ['game', 'Juego', 60], ['status', 'Estado', 40], ['date', 'Fecha', 80], ['teams', 'Equipos', 80]]
const empty = { name: '', game: 'Valorant', status: '', date: '', teams: '' }

export default function TournamentEditor() {
  const { tournaments, tournamentsLoading, tournamentsError, reloadTournaments, createTournament, updateTournament, deleteTournament } = useCompetition()
  const [selection, setSelection] = useState(null)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const creating = selection === 'new'
  const selected = tournaments.find((item) => String(item.id) === selection) || tournaments[0]
  const values = draft || (creating ? empty : selected)

  const choose = (value) => {
    setSelection(value)
    setDraft(null)
    setMessage('')
    setError('')
  }
  const save = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const saved = creating ? await createTournament(values) : await updateTournament(selected.id, values)
      setSelection(String(saved.id))
      setDraft(null)
      setMessage(creating ? 'Torneo creado correctamente.' : 'Torneo actualizado correctamente.')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async () => {
    if (busy || !selected || !window.confirm(`¿Eliminar el torneo ${selected.name}?`)) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await deleteTournament(selected.id)
      setSelection(null)
      setDraft(null)
      setMessage('Torneo eliminado correctamente.')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section__heading">
        <div><p className="page-eyebrow">Calendario competitivo</p><h3>{creating ? 'Agregar torneo' : 'Modificar torneo'}</h3></div>
        <select aria-label="Seleccionar torneo" disabled={busy || tournamentsLoading || Boolean(tournamentsError)} value={creating ? 'new' : selected?.id || ''} onChange={(event) => choose(event.target.value)}>
          {!tournaments.length && <option value="">Sin torneos</option>}
          {tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          <option value="new">Agregar torneo</option>
        </select>
      </div>
      {tournamentsLoading && <p role="status">Cargando torneos…</p>}
      {tournamentsError && <div role="alert"><p>{tournamentsError}</p><button type="button" disabled={busy || tournamentsLoading} onClick={reloadTournaments}>Reintentar</button></div>}
      {!tournamentsLoading && !tournamentsError && !values && <p>No hay torneos registrados. Selecciona «Agregar torneo» para crear el primero.</p>}
      {!tournamentsLoading && !tournamentsError && values && (
        <form className="admin-editor__form admin-editor__form--standalone" onSubmit={save}>
          <div className="admin-editor__grid">
            {fields.map(([field, label, maxLength]) => (
              <label key={field}><span>{label}</span><input required disabled={busy} maxLength={maxLength} value={values[field] || ''} onChange={(event) => setDraft({ ...values, [field]: event.target.value })} /></label>
            ))}
          </div>
          <div className="admin-editor__actions">
            <button className="admin-editor__save" disabled={busy} type="submit">{busy ? 'Procesando…' : creating ? 'Crear torneo' : 'Guardar torneo'}</button>
            {!creating && <button className="admin-editor__delete" disabled={busy} onClick={remove} type="button">Eliminar torneo</button>}
          </div>
        </form>
      )}
      {message && <p className="admin-editor__message" role="status">{message}</p>}
      {error && <p className="admin-editor__message" role="alert">{error}</p>}
    </section>
  )
}
