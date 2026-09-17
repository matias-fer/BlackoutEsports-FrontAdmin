import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { rostersApi, tournamentsApi } from '../api/competition'
import { useAuth } from '../auth/AuthProvider'

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

export function CompetitionProvider({ children }) {
  const { user, getAccessToken } = useAuth()
  const [tournaments, setTournaments] = useState(defaultTournaments)
  const [teams, setTeams] = useState(defaultTeams)
  const [competitionLoading, setCompetitionLoading] = useState(false)
  const [competitionError, setCompetitionError] = useState('')

  const withToken = useCallback(async (operation) => {
    const token = await getAccessToken()
    if (!token) throw new Error('Inicia sesión para conectarte con los microservicios de competición.')
    return operation(token)
  }, [getAccessToken])

  const reloadCompetition = useCallback(async () => {
    if (!user) return
    setCompetitionLoading(true)
    const token = await getAccessToken().catch(() => null)
    if (!token) {
      setCompetitionError('No fue posible obtener el access token para consultar los microservicios.')
      setCompetitionLoading(false)
      return
    }

    const [tournamentsResult, rostersResult] = await Promise.allSettled([
      tournamentsApi.list(token),
      rostersApi.list(token),
    ])
    const errors = []
    if (tournamentsResult.status === 'fulfilled') setTournaments(tournamentsResult.value)
    else errors.push(`Torneos: ${tournamentsResult.reason.message}`)
    if (rostersResult.status === 'fulfilled') setTeams(rostersResult.value)
    else errors.push(`Roster: ${rostersResult.reason.message}`)
    setCompetitionError(errors.join(' '))
    setCompetitionLoading(false)
  }, [getAccessToken, user])

  useEffect(() => { reloadCompetition() }, [reloadCompetition])

  const updateTournament = useCallback(async (tournament) => {
    const updated = await withToken((token) => tournamentsApi.update(tournament, token))
    setTournaments((current) => current.map((item) => item.id === updated.id ? updated : item))
    return updated
  }, [withToken])

  const updateTeam = useCallback(async (team) => {
    const request = { game: 'Valorant', playerIds: [], ...team }
    const updated = await withToken((token) => rostersApi.update(request, token))
    setTeams((current) => current.map((item) => item.id === updated.id ? updated : item))
    return updated
  }, [withToken])

  const value = useMemo(() => ({
    tournaments,
    teams,
    competitionLoading,
    competitionError,
    reloadCompetition,
    updateTournament,
    updateTeam,
  }), [competitionError, competitionLoading, reloadCompetition, teams, tournaments, updateTeam, updateTournament])

  return <CompetitionContext.Provider value={value}>{children}</CompetitionContext.Provider>
}

export function useCompetition() {
  const context = useContext(CompetitionContext)
  if (!context) throw new Error('useCompetition debe usarse dentro de CompetitionProvider')
  return context
}
