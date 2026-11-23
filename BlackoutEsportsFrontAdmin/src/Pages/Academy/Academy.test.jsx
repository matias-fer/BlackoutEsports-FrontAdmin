import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import Academy from './Academy'
import { useAuth } from '../../auth/AuthProvider'
import { apiRequest } from '../../api/client'

vi.mock('../../auth/AuthProvider', () => ({ useAuth: vi.fn() }))
vi.mock('../../api/client', () => ({ apiRequest: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks() })

it('envía los antecedentes del fan y muestra su estado', async () => {
  useAuth.mockReturnValue({ user: { source: 'cognito' }, getAccessToken: async () => 'fan' })
  apiRequest.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: '1', alias: 'Luna', game: 'Valorant', decision: 'PENDING' })
  render(<Academy />)
  await screen.findByText('Enviar postulación')
  for (const input of screen.getAllByRole('textbox')) fireEvent.change(input, { target: { value: 'Luna' } })
  fireEvent.click(screen.getByText('Enviar postulación'))
  await screen.findByText('Pendiente')
  expect(apiRequest).toHaveBeenCalledWith('users', '/api/academy/me', 'fan', expect.objectContaining({ method: 'POST' }))
})

it('permite al staff rechazar después de confirmar', async () => {
  useAuth.mockReturnValue({ user: { source: 'entra' }, isAdmin: true, getAccessToken: async () => 'staff' })
  const row = { id: '123', alias: 'Luna', game: 'Valorant', decision: 'PENDING', delivery: 'NONE' }
  apiRequest.mockResolvedValueOnce([row]).mockResolvedValueOnce({ ...row, decision: 'REJECTED', delivery: 'PENDING' })
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<Academy />)
  fireEvent.change(await screen.findByLabelText('Decisión'), { target: { value: 'REJECTED' } })
  fireEvent.click(screen.getByText('Confirmar decisión'))
  await waitFor(() => expect(apiRequest).toHaveBeenCalledWith('users', '/api/academy/applications/123/decision', 'staff', {
    method: 'PUT', body: '{"decision":"REJECTED"}',
  }))
  await screen.findByText('Rechazada')
})

it('el staff puede consultar el registro recibido de forma asíncrona', async () => {
  useAuth.mockReturnValue({ user: { source: 'entra' }, isAdmin: true, getAccessToken: async () => 'staff' })
  apiRequest.mockResolvedValueOnce([{ id: '123', alias: 'Luna', game: 'Valorant', decision: 'REJECTED' }])
    .mockResolvedValueOnce([{ applicationId: '123', decision: 'REJECTED', decidedAt: '2026-11-22T12:00:00Z' }])
  render(<Academy />)
  await screen.findByText('Luna · Valorant')
  fireEvent.click(screen.getByText('Ver registro de decisiones'))
  await screen.findByRole('region', { name: 'Registro de decisiones' })
  expect(apiRequest).toHaveBeenCalledWith('users', '/api/academy/applications/audit', 'staff')
})
