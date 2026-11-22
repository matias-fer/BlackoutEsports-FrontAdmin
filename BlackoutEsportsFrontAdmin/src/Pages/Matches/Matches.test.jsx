import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import Matches from './Matches'
import { useAuth } from '../../auth/AuthProvider'
import { apiRequest } from '../../api/client'

vi.mock('../../auth/AuthProvider', () => ({ useAuth: vi.fn() }))
vi.mock('../../api/client', () => ({ apiRequest: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks() })

it('anular requiere solo confirmación y usa la versión del partido', async () => {
  useAuth.mockReturnValue({ isAdmin: true, getAccessToken: async () => 'admin' })
  apiRequest.mockImplementation(async (_, path) => path === '/api/matches/manage'
    ? [{ id: 'match', sequence: 4, teamA: 'Blackout', teamB: 'Phoenix', game: 'Valorant', status: 'LIVE', rounds: ['A'] }]
    : [])
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  render(<Matches />)
  fireEvent.click(await screen.findByText('Anular última ronda'))
  expect(apiRequest.mock.calls.some(call => call[1].includes('/commands'))).toBe(false)
  confirm.mockReturnValue(true)
  fireEvent.click(screen.getByText('Anular última ronda'))
  await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('tournaments', '/api/matches/match/commands', 'admin', {
    method: 'POST', body: '{"action":"REVERT","expectedVersion":4}',
  }))
  expect(screen.queryByLabelText(/quien|nombre/i)).toBeNull()
})

it('un visitante ve el marcador sin botones administrativos', async () => {
  useAuth.mockReturnValue({ isAdmin: false })
  apiRequest.mockResolvedValue([{ id: 's', teamA: 'Blackout', teamB: 'Phoenix', game: 'Valorant', status: 'LIVE', rounds: 'A,B,A' }])
  render(<Matches />)
  await screen.findByText('2 — 1')
  expect(screen.queryByText('Anular última ronda')).toBeNull()
})
