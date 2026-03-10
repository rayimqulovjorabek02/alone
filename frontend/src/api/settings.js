// src/api/settings.js
import api from './client'
export const settingsAPI = {
  get:    ()       => api.get('/api/settings/'),
  update: (data)   => api.put('/api/settings/', data),
  getPlans: ()     => api.get('/api/settings/plans'),
}