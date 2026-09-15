import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayersProvider, usePlayers } from './PlayersContext'

function PlayersProbe() {
  const { players, addPlayer } = usePlayers()

  return (
    <>
      <output data-testid="player-count">{players.length}</output>
      <button type="button" onClick={() => addPlayer({ alias: 'TestPlayer' })}>
        Agregar jugador
      </button>
    </>
  )
}

describe('PlayersContext', () => {
  beforeEach(() => window.localStorage.clear())

  it('carga los jugadores iniciales', () => {
    render(
      <PlayersProvider>
        <PlayersProbe />
      </PlayersProvider>,
    )

    expect(Number(screen.getByTestId('player-count').textContent)).toBeGreaterThan(0)
  })

  it('agrega y persiste un jugador', async () => {
    const user = userEvent.setup()

    render(
      <PlayersProvider>
        <PlayersProbe />
      </PlayersProvider>,
    )

    const initialCount = Number(screen.getByTestId('player-count').textContent)
    await user.click(screen.getByRole('button', { name: 'Agregar jugador' }))

    expect(screen.getByTestId('player-count')).toHaveTextContent(String(initialCount + 1))
    expect(window.localStorage.getItem('blackout-admin-players')).toContain('TestPlayer')
  })
})
