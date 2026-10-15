import { apiRequest } from './client'

export const notificationsApi = {
  list: (token) => apiRequest('users', '/api/notifications', token),
}
