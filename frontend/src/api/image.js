// src/api/image.js
import api from './client'

export const generateImage = (prompt, style = 'realistic') =>
  api.post('/api/image/generate', { prompt, style })

export const getImageHistory = () =>
  api.get('/api/image/history')

export const getImageStyles = () =>
  api.get('/api/image/styles')