const baseUrl = (import.meta.env.VITE_TOURNAMENTS_API_URL || 'http://localhost:8082').replace(/\/+$/, '')

async function request(path = '', options = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}/api/tournaments${path}`, {
      ...options,
      signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de torneos. Inténtalo nuevamente.')
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}))
    throw new Error(problem.detail || `No se pudo completar la operación (${response.status}).`)
  }
  return response.status === 204 ? undefined : response.json()
}

const payload = ({ name, game, status, date, teams }) => JSON.stringify({ name, game, status, date, teams })

export const tournamentsApi = {
  list: () => request(),
  create: (data) => request('', { method: 'POST', body: payload(data) }),
  update: (id, data) => request(`/${encodeURIComponent(id)}`, { method: 'PUT', body: payload(data) }),
  remove: (id) => request(`/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
