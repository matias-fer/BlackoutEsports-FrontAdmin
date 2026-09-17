import { apiRequest } from './client'

function peripheral(type, name, specs = '') {
  return { type, name: name || '', specs, search: name || '' }
}

export function playerFromApi(player) {
  const settings = player.settings || {}
  const gear = player.gear || {}
  const sensitivity = settings.inGameSens && settings.dpi
    ? `${settings.inGameSens} @ ${settings.dpi} DPI`
    : ''

  return {
    id: player.id,
    alias: player.handle,
    name: player.realName || '',
    team: player.team,
    game: player.game,
    role: player.role,
    country: player.countryCode,
    sensitivity,
    mouse: gear.mouse || '',
    keyboard: gear.keyboard || '',
    headset: gear.headset || '',
    monitor: gear.monitor || '',
    peripherals: [
      peripheral('Mouse', gear.mouse, settings.dpi ? `${settings.dpi} DPI` : ''),
      peripheral('Teclado', gear.keyboard),
      peripheral('Headset', gear.headset),
      peripheral('Monitor', gear.monitor, settings.hz ? `${settings.hz} Hz` : ''),
    ],
    apiData: player,
  }
}

function peripheralName(player, type, fallback) {
  return player.peripherals?.find((item) => item.type.toLowerCase() === type)?.name || fallback || ''
}

function parseSensitivity(value, previousSettings = {}) {
  const match = String(value || '').match(/([0-9]+(?:[.,][0-9]+)?)\s*@\s*([0-9]+)\s*DPI/i)
  return {
    ...previousSettings,
    dpi: match ? Number(match[2]) : (previousSettings.dpi || 800),
    inGameSens: match ? Number(match[1].replace(',', '.')) : (previousSettings.inGameSens || 0.32),
  }
}

export function playerToApi(player, includeId = false) {
  const previous = player.apiData || {}
  const request = {
    handle: player.alias.trim(),
    realName: player.name.trim(),
    team: player.team.trim(),
    countryCode: player.country.trim().toUpperCase(),
    role: player.role.trim(),
    game: player.game.trim(),
    settings: parseSensitivity(player.sensitivity, previous.settings),
    crosshair: previous.crosshair || null,
    gear: {
      ...(previous.gear || {}),
      mouse: peripheralName(player, 'mouse', player.mouse),
      keyboard: peripheralName(player, 'teclado', player.keyboard),
      headset: peripheralName(player, 'headset', player.headset),
      monitor: peripheralName(player, 'monitor', player.monitor),
    },
  }
  if (includeId && player.id) request.id = player.id
  return request
}

export const playersApi = {
  async list(token) {
    const players = await apiRequest('players', '/api/players', token)
    return players.map(playerFromApi)
  },
  async create(player, token) {
    return playerFromApi(await apiRequest('players', '/api/players', token, {
      method: 'POST',
      body: JSON.stringify(playerToApi(player, true)),
    }))
  },
  async update(player, token) {
    return playerFromApi(await apiRequest('players', `/api/players/${encodeURIComponent(player.id)}`, token, {
      method: 'PUT',
      body: JSON.stringify(playerToApi(player)),
    }))
  },
  delete(id, token) {
    return apiRequest('players', `/api/players/${encodeURIComponent(id)}`, token, { method: 'DELETE' })
  },
}
