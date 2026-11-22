import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { apiRequest } from '../../api/client'
import '../Admin/Admin.css'

const labels = { SCHEDULED: 'Programado', LIVE: 'En juego', FINISHED: 'Finalizado' }

export default function Matches() {
  const { isAdmin, getAccessToken } = useAuth()
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [tournaments, setTournaments] = useState([])
  useEffect(() => {
    let active = true
    let timer
    async function update() {
      try {
        const [matches, statistics] = await Promise.all([
          apiRequest('tournaments', isAdmin ? '/api/matches/manage' : '/api/matches', isAdmin ? await getAccessToken() : null),
          apiRequest('tournaments', '/api/matches/statistics', null),
        ])
        if (active) { setRows(matches); setStats(statistics); setError('') }
      } catch (e) { if (active) setError(e.message) }
      finally { if (active) timer = setTimeout(update, 2000) }
    }
    update()
    return () => { active = false; clearTimeout(timer) }
  }, [isAdmin, getAccessToken, refresh])
  useEffect(() => {
    if (!isAdmin) return
    let active = true
    apiRequest('tournaments', '/api/tournaments', null)
      .then(data => { if (active) setTournaments(data) })
      .catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [isAdmin])
  async function request(path, body) {
    setBusy(true)
    setNotice('')
    try {
      await apiRequest('tournaments', path, await getAccessToken(), { method: 'POST', body: JSON.stringify(body) })
      setNotice('Cambio registrado.')
      setRefresh(n => n + 1)
      return true
    } catch (e) { setError(e.message); return false }
    finally { setBusy(false) }
  }
  function command(m, action) {
    if (action === 'REVERT' && !window.confirm('¿Anular la última ronda?')) return
    if (action === 'FINISH' && !window.confirm('¿Finalizar este partido?')) return
    request('/api/matches/' + m.id + '/commands', { action, expectedVersion: m.sequence })
  }
  const winners = stats.filter(m => m.status === 'FINISHED' && m.winner).reduce((result, m) => {
    result[m.winner] = (result[m.winner] || 0) + 1
    return result
  }, {})
  return <section className="admin-page">
    <h2>Partidos en vivo</h2>
    {error && <p role="alert">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {isAdmin && <form className="card bg-dark text-light p-4 mb-4 d-grid gap-3" onSubmit={async e => {
      e.preventDefault()
      const form = e.currentTarget
      const data = Object.fromEntries(new FormData(form))
      data.tournamentId = Number(data.tournamentId)
      if (await request('/api/matches', data)) form.reset()
    }}>
      <h3>Crear partido</h3>
      <label>Torneo<select className="form-select" name="tournamentId" required defaultValue="">
        <option value="" disabled>Selecciona un torneo</option>
        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select></label>
      {[['teamA', 'Equipo A'], ['teamB', 'Equipo B'], ['game', 'Videojuego']].map(([name, label]) =>
        <label key={name}>{label}<input className="form-control" name={name} required maxLength={100} /></label>)}
      <button className="btn btn-light" disabled={busy}>Crear partido</button>
    </form>}
    {!rows.length && <p>No hay partidos disponibles.</p>}
    {rows.map(m => {
      const rounds = Array.isArray(m.rounds) ? m.rounds : (m.rounds ? m.rounds.split(',') : [])
      const a = rounds.filter(r => r === 'A').length
      const b = rounds.length - a
      return <article key={m.id} className="card bg-dark text-light p-4 mb-3">
        <p>{m.game} · {labels[m.status]}</p>
        <h3>{m.teamA} <strong>{a} — {b}</strong> {m.teamB}</h3>
        {m.status === 'FINISHED' && <p>Ganador · {a > b ? m.teamA : m.teamB}</p>}
        {isAdmin && <div className="d-flex flex-wrap gap-2 my-3">
          {m.status === 'SCHEDULED' && <button className="btn btn-light" disabled={busy} onClick={() => command(m, 'START')}>Iniciar partido</button>}
          {m.status === 'LIVE' && <>
            <button className="btn btn-light" disabled={busy} onClick={() => command(m, 'A')}>Ronda para {m.teamA}</button>
            <button className="btn btn-light" disabled={busy} onClick={() => command(m, 'B')}>Ronda para {m.teamB}</button>
            <button className="btn btn-outline-light" disabled={busy || !rounds.length} onClick={() => command(m, 'REVERT')}>Anular última ronda</button>
            <button className="btn btn-outline-light" disabled={busy || a === b} onClick={() => command(m, 'FINISH')}>Finalizar partido</button>
          </>}
        </div>}
        <details><summary>Historial de rondas ({rounds.length})</summary>
          <ol>{rounds.map((winner, i) => <li key={i}>Ganó {winner === 'A' ? m.teamA : m.teamB}</li>)}</ol>
        </details>
      </article>
    })}
    <h3>Victorias por equipo</h3>
    {Object.entries(winners).map(([team, wins]) => <p key={team}>{team} · {wins}</p>)}
  </section>
}
