import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { tournamentsApi } from '../api/tournaments'

const STORAGE_KEY = 'blackout-admin-competition'
const defaultTeams = [
  { name: 'Blackout Esports', label: 'Equipo principal', number: '01', status: '' },
  { name: 'Blackout Academy', label: 'Equipo de desarrollo', number: '02', status: '' },
  { name: 'Blackout Game Changers', label: 'Escena competitiva femenina', number: '03', status: 'Próximamente' },
]
const CompetitionContext = createContext(null)

function readCompetition() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return { teams: saved ? JSON.parse(saved).teams || defaultTeams : defaultTeams }
  } catch {
    return { teams: defaultTeams }
  }
}

export function CompetitionProvider({ children }) {
  const [competition, setCompetition] = useState(readCompetition)

  const saveCompetition = (nextCompetition) => {
    const next = { teams: nextCompetition.teams }
    setCompetition(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const [tournaments, setTournaments] = useState([])
  const [tournamentsLoading, setTournamentsLoading] = useState(true)
  const [tournamentsError, setTournamentsError] = useState('')
  const reloadTournaments = useCallback(async () => {
    setTournamentsLoading(true)
    setTournamentsError('')
    try {
      const items = await tournamentsApi.list()
      if (!Array.isArray(items)) throw new Error('El servicio devolvió una lista de torneos inválida.')
      setTournaments(items)
    } catch (error) {
      setTournamentsError(error.message)
    } finally {
      setTournamentsLoading(false)
    }
  }, [])
  useEffect(() => { void reloadTournaments() }, [reloadTournaments])

  const createTournament = async (data) => {
    const saved = await tournamentsApi.create(data)
    setTournaments((items) => [...items, saved])
    return saved
  }
  const updateTournament = async (id, data) => {
    const saved = await tournamentsApi.update(id, data)
    setTournaments((items) => items.map((item) => item.id === id ? saved : item))
    return saved
  }
  const deleteTournament = async (id) => {
    await tournamentsApi.remove(id)
    setTournaments((items) => items.filter((item) => item.id !== id))
  }

  return <CompetitionContext.Provider value={{ ...competition, saveCompetition, tournaments, tournamentsLoading, tournamentsError, reloadTournaments, createTournament, updateTournament, deleteTournament }}>{children}</CompetitionContext.Provider>
}

export function useCompetition() {
  const context = useContext(CompetitionContext)
  if (!context) throw new Error('useCompetition debe usarse dentro de CompetitionProvider')
  return context
}
