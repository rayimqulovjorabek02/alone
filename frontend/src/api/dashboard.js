// src/api/dashboard.js
import api from './client'

export const dashboardAPI = {
  getStats:    () => api.get('/api/dashboard/stats'),
  getActivity: () => api.get('/api/dashboard/activity'),
  getUsage:    () => api.get('/api/dashboard/usage'),
}