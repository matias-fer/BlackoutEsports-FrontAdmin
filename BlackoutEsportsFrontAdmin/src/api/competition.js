import { apiRequest } from './client'

export const tournamentsApi = {
  list: (token) => apiRequest('tournaments', '/api/tournaments', token),
  create: (tournament, token) => apiRequest('tournaments', '/api/tournaments', token, {
    method: 'POST',
    body: JSON.stringify(tournament),
  }),
  update: (tournament, token) => apiRequest('tournaments', `/api/tournaments/${tournament.id}`, token, {
    method: 'PUT',
    body: JSON.stringify(tournament),
  }),
  delete: (id, token) => apiRequest('tournaments', `/api/tournaments/${id}`, token, { method: 'DELETE' }),
}

export const rostersApi = {
  list: (token) => apiRequest('roster', '/api/rosters', token),
  create: (roster, token) => apiRequest('roster', '/api/rosters', token, {
    method: 'POST',
    body: JSON.stringify(roster),
  }),
  update: (roster, token) => apiRequest('roster', `/api/rosters/${roster.id}`, token, {
    method: 'PUT',
    body: JSON.stringify(roster),
  }),
  delete: (id, token) => apiRequest('roster', `/api/rosters/${id}`, token, { method: 'DELETE' }),
}
