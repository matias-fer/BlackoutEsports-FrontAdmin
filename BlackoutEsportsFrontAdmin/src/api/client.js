const apiUrls = {
  players: import.meta.env.VITE_PLAYERS_API_URL || 'http://localhost:8081',
  tournaments: import.meta.env.VITE_TOURNAMENTS_API_URL || 'http://localhost:8082',
  users: import.meta.env.VITE_USERS_API_URL || 'http://localhost:8083',
  roster: import.meta.env.VITE_ROSTER_API_URL || 'http://localhost:8084',
}

function buildUrl(service, path) {
  const baseUrl = apiUrls[service]
  if (!baseUrl) throw new Error(`Falta configurar la URL del microservicio ${service}.`)
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function readError(response) {
  try {
    const body = await response.json()
    return body.message || body.detail || body.error || JSON.stringify(body)
  } catch {
    return response.statusText
  }
}

export async function apiRequest(service, path, token, options = {}) {
  if (!token) throw new Error('Inicia sesión para consultar los microservicios.')

  const response = await fetch(buildUrl(service, path), {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const detail = await readError(response)
    if (response.status === 403) {
      throw new Error('Tu cuenta no tiene permiso para realizar esta operación.')
    }
    throw new Error(detail || `El microservicio respondió con estado ${response.status}.`)
  }

  if (response.status === 204) return null
  return response.json()
}
