import { apiRequest } from './client'

export const notificationsApi = {
  list: (token, source) => apiRequest('users', source === 'entra' ? '/api/notifications/staff' : '/api/notifications', token),
}
