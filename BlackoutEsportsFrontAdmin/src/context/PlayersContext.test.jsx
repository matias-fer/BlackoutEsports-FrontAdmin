import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PlayersProvider, usePlayers } from './PlayersContext'

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: null, getAccessToken: async () => 'access-token' }),
}))

vi.mock('../api/players', () => ({
  playersApi: {
    list: vi.fn(async () => [{ id: 'db-player', alias: 'Jugador DB' }]),
    create: vi.fn(async (player) => ({ ...player, id: 'test-player' })),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

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
  it('carga los jugadores públicos desde el microservicio sin iniciar sesión', async () => {
    render(
      <PlayersProvider>
        <PlayersProbe />
      </PlayersProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('player-count')).toHaveTextContent('1'))
  })

  it('agrega un jugador devuelto por el microservicio', async () => {
    const user = userEvent.setup()

    render(
      <PlayersProvider>
        <PlayersProbe />
      </PlayersProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('player-count')).toHaveTextContent('1'))
    const initialCount = Number(screen.getByTestId('player-count').textContent)
    await user.click(screen.getByRole('button', { name: 'Agregar jugador' }))

    expect(await screen.findByText(String(initialCount + 1))).toBeInTheDocument()
  })
})
