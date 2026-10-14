import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { rostersApi, tournamentsApi } from '../api/competition'
import { useAuth } from '../auth/AuthProvider'

const CompetitionContext = createContext(null)

export function CompetitionProvider({ children }) {
  const { getAccessToken } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
  const [competitionLoading, setCompetitionLoading] = useState(false)
  const [competitionError, setCompetitionError] = useState('')

  const withToken = useCallback(async (operation) => {
    const token = await getAccessToken()
    if (!token) throw new Error('Inicia sesión para conectarte con los microservicios de competición.')
    return operation(token)
  }, [getAccessToken])

  const reloadCompetition = useCallback(async () => {
    setCompetitionLoading(true)
    const [tournamentsResult, rostersResult] = await Promise.allSettled([
      tournamentsApi.list(),
      rostersApi.list(),
    ])
    const errors = []
    if (tournamentsResult.status === 'fulfilled') setTournaments(tournamentsResult.value)
    else errors.push(`Torneos: ${tournamentsResult.reason.message}`)
    if (rostersResult.status === 'fulfilled') setTeams(rostersResult.value)
    else errors.push(`Roster: ${rostersResult.reason.message}`)
    setCompetitionError(errors.join(' '))
    setCompetitionLoading(false)
  }, [])

  useEffect(() => { reloadCompetition() }, [reloadCompetition])

  const updateTournament = useCallback(async (tournament) => {
    const updated = await withToken((token) => tournamentsApi.update(tournament, token))
    setTournaments((current) => current.map((item) => item.id === updated.id ? updated : item))
    return updated
  }, [withToken])

  const addTournament = useCallback(async (tournament) => {
    const created = await withToken((token) => tournamentsApi.create(tournament, token))
    setTournaments((current) => [...current, created])
    return created
  }, [withToken])

  const deleteTournament = useCallback(async (id) => {
    await withToken((token) => tournamentsApi.delete(id, token))
    setTournaments((current) => current.filter((item) => item.id !== id))
  }, [withToken])

  const updateTeam = useCallback(async (team) => {
    const request = { game: 'Valorant', playerIds: [], ...team }
    const updated = await withToken((token) => rostersApi.update(request, token))
    setTeams((current) => current.map((item) => item.id === updated.id ? updated : item))
    return updated
  }, [withToken])

  const addTeam = useCallback(async (team) => {
    const request = { game: 'Valorant', playerIds: [], ...team }
    const created = await withToken((token) => rostersApi.create(request, token))
    setTeams((current) => [...current, created])
    return created
  }, [withToken])

  const deleteTeam = useCallback(async (id) => {
    await withToken((token) => rostersApi.delete(id, token))
    setTeams((current) => current.filter((item) => item.id !== id))
  }, [withToken])

  const value = useMemo(() => ({
    tournaments,
    teams,
    competitionLoading,
    competitionError,
    reloadCompetition,
    addTournament,
    updateTournament,
    deleteTournament,
    addTeam,
    updateTeam,
    deleteTeam,
  }), [addTeam, addTournament, competitionError, competitionLoading, deleteTeam, deleteTournament, reloadCompetition, teams, tournaments, updateTeam, updateTournament])

  return <CompetitionContext.Provider value={value}>{children}</CompetitionContext.Provider>
}

export function useCompetition() {
  const context = useContext(CompetitionContext)
  if (!context) throw new Error('useCompetition debe usarse dentro de CompetitionProvider')
  return context
}
