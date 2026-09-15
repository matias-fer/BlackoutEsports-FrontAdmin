import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'

test('Contrato HTTP y manejo de errores del cliente de torneos', async () => {
  const source = await readFile(new URL('../src/api/tournaments.js', import.meta.url), 'utf8')
  const { tournamentsApi: api } = await import('data:text/javascript;base64,' + Buffer.from(source.replace('import.meta.env.VITE_TOURNAMENTS_API_URL', 'undefined')).toString('base64'))
  const originalFetch = globalThis.fetch
  const calls = []
  const tournament = { id: 7, name: 'Copa', game: 'Valorant', status: 'Abierto', date: 'Octubre', teams: '8' }
  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ url, ...options })
      return new Response(options.method === 'DELETE' ? null : JSON.stringify(options.method ? tournament : [tournament]), { status: options.method === 'DELETE' ? 204 : 200 })
    }
    assert.deepEqual(await api.list(), [tournament])
    assert.deepEqual(await api.create(tournament), tournament)
    assert.deepEqual(await api.update(7, tournament), tournament)
    assert.equal(await api.remove(7), undefined)
    assert.deepEqual(calls.map(c => [c.url, c.method || 'GET']), [
      ['http://localhost:8082/api/tournaments', 'GET'],
      ['http://localhost:8082/api/tournaments', 'POST'],
      ['http://localhost:8082/api/tournaments/7', 'PUT'],
      ['http://localhost:8082/api/tournaments/7', 'DELETE'],
    ])
    assert.equal(JSON.parse(calls[1].body).id, undefined)
    globalThis.fetch = async () => new Response(JSON.stringify({ detail: 'Torneo duplicado' }), { status: 409 })
    await assert.rejects(api.create(tournament), /Torneo duplicado/)
    globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
    await assert.rejects(api.list(), /503/)
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
    await assert.rejects(api.list(), /No se pudo conectar/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
