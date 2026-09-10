import { createContext, useContext, useState } from 'react'

const STORAGE_KEY = 'blackout-admin-competition'
const defaultTournaments = [
  { name: 'OpsLeague', game: 'Valorant', status: 'En curso', date: 'EN VIVO', teams: '16 equipos' },
  { name: 'Flash Strike', game: 'Valorant', status: 'Próximamente', date: '24 SEP 2026', teams: '24 equipos' },
]
const defaultTeams = [
  { name: 'Blackout Esports', label: 'Equipo principal', number: '01', status: '' },
  { name: 'Blackout Academy', label: 'Equipo de desarrollo', number: '02', status: '' },
  { name: 'Blackout Game Changers', label: 'Escena competitiva femenina', number: '03', status: 'Próximamente' },
]
const CompetitionContext = createContext(null)

function readCompetition() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { tournaments: defaultTournaments, teams: defaultTeams }
  } catch {
    return { tournaments: defaultTournaments, teams: defaultTeams }
  }
}

export function CompetitionProvider({ children }) {
  const [competition, setCompetition] = useState(readCompetition)

  const saveCompetition = (nextCompetition) => {
    setCompetition(nextCompetition)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompetition))
  }

  return <CompetitionContext.Provider value={{ ...competition, saveCompetition }}>{children}</CompetitionContext.Provider>
}

export function useCompetition() {
  const context = useContext(CompetitionContext)
  if (!context) throw new Error('useCompetition debe usarse dentro de CompetitionProvider')
  return context
}
