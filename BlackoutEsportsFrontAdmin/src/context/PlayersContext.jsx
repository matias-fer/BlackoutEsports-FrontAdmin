import { createContext, useContext, useState } from 'react'
import initialPlayers from '../Pages/Players/playersData'

const STORAGE_KEY = 'blackout-admin-players'
const PlayersContext = createContext(null)

function readPlayers() {
  try {
    const savedPlayers = window.localStorage.getItem(STORAGE_KEY)
    return savedPlayers ? JSON.parse(savedPlayers) : initialPlayers
  } catch {
    return initialPlayers
  }
}

export function PlayersProvider({ children }) {
  const [players, setPlayers] = useState(readPlayers)

  const savePlayers = (nextPlayers) => {
    setPlayers(nextPlayers)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlayers))
  }

  const addPlayer = (player) => savePlayers([...players, player])

  return (
    <PlayersContext.Provider value={{ players, savePlayers, addPlayer }}>
      {children}
    </PlayersContext.Provider>
  )
}

export function usePlayers() {
  const context = useContext(PlayersContext)
  if (!context) throw new Error('usePlayers debe usarse dentro de PlayersProvider')
  return context
}
