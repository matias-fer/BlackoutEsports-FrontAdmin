import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { playersApi } from '../api/players'
import { useAuth } from '../auth/AuthProvider'

const PlayersContext = createContext(null)

export function PlayersProvider({ children }) {
  const { getAccessToken } = useAuth()
  const [players, setPlayers] = useState([])
  const [playersLoading, setPlayersLoading] = useState(false)
  const [playersError, setPlayersError] = useState('')

  const withToken = useCallback(async (operation) => {
    const token = await getAccessToken()
    if (!token) throw new Error('Inicia sesión para conectarte con el microservicio de jugadores.')
    return operation(token)
  }, [getAccessToken])

  const reloadPlayers = useCallback(async () => {
    setPlayersLoading(true)
    try {
      setPlayers(await playersApi.list())
      setPlayersError('')
    } catch (error) {
      setPlayersError(error.message)
    } finally {
      setPlayersLoading(false)
    }
  }, [])

  useEffect(() => { reloadPlayers() }, [reloadPlayers])

  const addPlayer = useCallback(async (player) => {
    const created = await withToken((token) => playersApi.create(player, token))
    setPlayers((current) => [...current, created])
    return created
  }, [withToken])

  const updatePlayer = useCallback(async (player) => {
    const updated = await withToken((token) => playersApi.update(player, token))
    setPlayers((current) => current.map((item) => item.id === updated.id ? updated : item))
    return updated
  }, [withToken])

  const deletePlayer = useCallback(async (id) => {
    await withToken((token) => playersApi.delete(id, token))
    setPlayers((current) => current.filter((item) => item.id !== id))
  }, [withToken])

  const value = useMemo(() => ({
    players,
    playersLoading,
    playersError,
    reloadPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
  }), [addPlayer, deletePlayer, players, playersError, playersLoading, reloadPlayers, updatePlayer])

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  )
}

export function usePlayers() {
  const context = useContext(PlayersContext)
  if (!context) throw new Error('usePlayers debe usarse dentro de PlayersProvider')
  return context
}
