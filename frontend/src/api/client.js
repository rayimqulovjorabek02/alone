// src/api/client.js — Axios instance
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
})

// Request interceptor — token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — token yangilash
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        window.location.href = '/login'
        return Promise.reject(err)
      }
      try {
        const { data } = await axios.post('/api/auth/refresh', { refresh_token: refresh })
        localStorage.setItem('access_token', data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api