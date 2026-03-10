// src/api/todo.js
import api from './client'

export const todoAPI = {
  getAll:    (filters = {}) => api.get('/api/todo/', { params: filters }),
  create:    (data)         => api.post('/api/todo/', data),
  update:    (id, data)     => api.put(`/api/todo/${id}`, data),
  delete:    (id)           => api.delete(`/api/todo/${id}`),
  toggle:    (id)           => api.patch(`/api/todo/${id}/toggle`),
  getStats:  ()             => api.get('/api/todo/stats'),
}