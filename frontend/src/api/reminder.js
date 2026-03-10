import api from './client'

export const reminderAPI = {
  getAll:      ()         => api.get('/api/reminder/'),
  getDue:      ()         => api.get('/api/reminder/due'),
  getUpcoming: (hours)    => api.get('/api/reminder/upcoming?hours=' + (hours || 24)),
  create:      (data)     => api.post('/api/reminder/', data),
  markDone:    (id)       => api.patch('/api/reminder/' + id + '/done'),
  delete:      (id)       => api.delete('/api/reminder/' + id),
  toggle:      (id)       => api.patch('/api/reminder/' + id + '/toggle'),
  getStats:    ()         => api.get('/api/reminder/stats'),
}