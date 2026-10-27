import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { vi, beforeEach, afterEach, test, expect } from 'vitest'
import Admin from './Admin'

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), remove: vi.fn() }))
vi.mock('../../auth/AuthProvider', () => ({ useAuth: () => ({ user: { email: 'admin@test.local' }, isAdmin: true }) }))
vi.mock('../../context/PlayersContext', () => ({ usePlayers: () => ({
  players: [{ id: 1, alias: 'Jugador prueba', name: 'Jugador', peripherals: [] }],
  addPlayer: mocks.create, updatePlayer: mocks.update, deletePlayer: mocks.remove,
}) }))
vi.mock('../../context/CompetitionContext', () => ({ useCompetition: () => ({
  tournaments: [{ id: 2, name: 'Copa prueba', game: 'Valorant', status: 'Activo', date: '2026-11-01', teams: '4' }],
  teams: [{ id: 3, name: 'Roster prueba', game: 'Valorant', playerIds: [] }],
  addTournament: mocks.create, updateTournament: mocks.update, deleteTournament: mocks.remove,
  addTeam: mocks.create, updateTeam: mocks.update, deleteTeam: mocks.remove,
}) }))
beforeEach(() => {
  vi.resetAllMocks()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(cleanup)
function openSection(section) {
  render(<Admin />)
  fireEvent.click(screen.getByRole('button', { name: new RegExp('^' + section) }))
}
test.each(['Jugadores', 'Torneos', 'Rosters'])('confirma creación y conserva datos al cancelar o fallar: %s', async section => {
  openSection(section)
  fireEvent.change(screen.getAllByLabelText('Nombre')[0], { target: { value: 'Nuevo registro' } })
  const form = screen.getAllByLabelText('Nombre')[0].closest('form')
  fireEvent.submit(form)
  expect(mocks.create).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.getAllByLabelText('Nombre')[0].value).toBe('Nuevo registro')
  mocks.create.mockRejectedValueOnce(new Error('Error de conexión'))
  fireEvent.submit(form)
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  await screen.findByRole('alert')
  expect(screen.getAllByLabelText('Nombre')[0].value).toBe('Nuevo registro')
  mocks.create.mockResolvedValueOnce({ id: 9 })
  fireEvent.submit(form)
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  await screen.findByRole('status')
  expect(screen.getAllByLabelText('Nombre')[0].value).toBe('')
  expect(screen.getByLabelText('Juego').value).toBe('')
})
test.each(['Jugadores', 'Torneos', 'Rosters'])('limpia selección tras editar y eliminar: %s', async section => {
  openSection(section)
  fireEvent.click(screen.getByRole('button', { name: 'Administrar' }))
  const select = screen.getByRole('combobox')
  const id = section === 'Jugadores' ? '1' : section === 'Torneos' ? '2' : '3'
  fireEvent.change(select, { target: { value: id } })
  fireEvent.submit(screen.getAllByLabelText('Nombre')[0].closest('form'))
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  await waitFor(() => expect(select.value).toBe(''))
  expect(mocks.update).toHaveBeenCalledTimes(1)
  fireEvent.change(select, { target: { value: id } })
  fireEvent.click(screen.getByRole('button', { name: /^Eliminar / }))
  expect(screen.getByRole('dialog').textContent).toMatch(/prueba/)
  expect(mocks.remove).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  await waitFor(() => expect(select.value).toBe(''))
  expect(mocks.remove).toHaveBeenCalledWith(Number(id))
})
