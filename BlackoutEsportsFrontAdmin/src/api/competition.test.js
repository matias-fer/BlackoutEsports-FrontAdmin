import { afterEach, describe, expect, it, vi } from 'vitest'
import { rostersApi, tournamentsApi } from './competition'

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: vi.fn(async () => body),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('clientes de competición', () => {
  it('normaliza las referencias de jugadores recibidas desde roster', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([{
      id: 4,
      name: 'Blackout Esports',
      game: 'Valorant',
      label: 'Equipo principal',
      number: '01',
      status: 'Activo',
      playerIds: ['prinzcl', 'nightowl'],
    }])))

    const result = await rostersApi.list()

    expect(result[0].playerIds).toEqual(['prinzcl', 'nightowl'])
    expect(fetch).toHaveBeenCalledWith('http://localhost:8084/api/rosters', expect.objectContaining({
      headers: expect.not.objectContaining({ Authorization: expect.anything() }),
    }))
  })

  it('envía al backend solo los campos aceptados al crear un torneo', async () => {
    const created = {
      id: 8,
      name: 'Copa Sur',
      game: 'Valorant',
      status: 'Programado',
      date: '20 OCT 2026',
      teams: '16 equipos',
    }
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(created, 201)))

    await tournamentsApi.create({ ...created, id: null, name: '  Copa Sur  ', localOnly: true }, 'token-admin')

    const request = fetch.mock.calls[0][1]
    expect(request.method).toBe('POST')
    expect(JSON.parse(request.body)).toEqual({
      name: 'Copa Sur',
      game: 'Valorant',
      status: 'Programado',
      date: '20 OCT 2026',
      teams: '16 equipos',
    })
  })

  it('envía los identificadores textuales de Players al crear un roster', async () => {
    const roster = {
      name: 'Blackout Esports',
      game: 'Valorant',
      label: 'Equipo principal',
      number: '01',
      status: 'Activo',
      playerIds: ['prinzcl', 'nightowl'],
    }
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ id: 3, ...roster }, 201)))

    await rostersApi.create(roster, 'token-admin')

    expect(JSON.parse(fetch.mock.calls[0][1].body).playerIds).toEqual(['prinzcl', 'nightowl'])
  })
})
