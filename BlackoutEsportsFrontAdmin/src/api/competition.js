import { apiRequest } from './client'

export function tournamentFromApi(tournament) {
  return {
    id: tournament.id,
    name: tournament.name || '',
    game: tournament.game || '',
    status: tournament.status || '',
    date: tournament.date || '',
    teams: tournament.teams || '',
  }
}

export function tournamentToApi(tournament) {
  return {
    name: tournament.name.trim(),
    game: tournament.game.trim(),
    status: tournament.status.trim(),
    date: tournament.date.trim(),
    teams: tournament.teams.trim(),
  }
}

export function rosterFromApi(roster) {
  return {
    id: roster.id,
    name: roster.name || '',
    game: roster.game || '',
    label: roster.label || '',
    number: roster.number || '',
    status: roster.status || '',
    playerIds: Array.isArray(roster.playerIds) ? roster.playerIds.map(String) : [],
  }
}

export function rosterToApi(roster) {
  return {
    name: roster.name.trim(),
    game: roster.game.trim(),
    label: roster.label?.trim() || '',
    number: roster.number?.trim() || '',
    status: roster.status?.trim() || '',
    playerIds: Array.isArray(roster.playerIds) ? roster.playerIds.map(String) : [],
  }
}

export const tournamentsApi = {
  async list(token) {
    const tournaments = await apiRequest('tournaments', '/api/tournaments', token)
    return tournaments.map(tournamentFromApi)
  },
  async create(tournament, token) {
    return tournamentFromApi(await apiRequest('tournaments', '/api/tournaments', token, {
      method: 'POST',
      body: JSON.stringify(tournamentToApi(tournament)),
    }))
  },
  async update(tournament, token) {
    return tournamentFromApi(await apiRequest('tournaments', `/api/tournaments/${encodeURIComponent(tournament.id)}`, token, {
      method: 'PUT',
      body: JSON.stringify(tournamentToApi(tournament)),
    }))
  },
  delete: (id, token) => apiRequest('tournaments', `/api/tournaments/${encodeURIComponent(id)}`, token, { method: 'DELETE' }),
}

export const rostersApi = {
  async list(token) {
    const rosters = await apiRequest('roster', '/api/rosters', token)
    return rosters.map(rosterFromApi)
  },
  async create(roster, token) {
    return rosterFromApi(await apiRequest('roster', '/api/rosters', token, {
      method: 'POST',
      body: JSON.stringify(rosterToApi(roster)),
    }))
  },
  async update(roster, token) {
    return rosterFromApi(await apiRequest('roster', `/api/rosters/${encodeURIComponent(roster.id)}`, token, {
      method: 'PUT',
      body: JSON.stringify(rosterToApi(roster)),
    }))
  },
  delete: (id, token) => apiRequest('roster', `/api/rosters/${encodeURIComponent(id)}`, token, { method: 'DELETE' }),
}
