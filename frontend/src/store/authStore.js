// src/store/authStore.js
import { create } from 'zustand'
import api from '../api/client'

export const useAuthStore = create((set, get) => ({
  user:         null,
  accessToken:  localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,

  isAuthenticated: () => {
    const token = get().accessToken
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  },

  isTokenExpired: () => {
    const token = get().accessToken
    if (!token) return true
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now() + 60_000
    } catch {
      return true
    }
  },

  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
    set({ accessToken: access, refreshToken: refresh || get().refreshToken })
  },

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    get().setTokens(data.access_token, data.refresh_token)
    set({ user: data.user })
    return data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, accessToken: null, refreshToken: null })
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      set({ user: data })
      return data
    } catch {
      get().logout()
    }
  },

  refreshAccessToken: async () => {
    const refresh = get().refreshToken
    if (!refresh) return null
    try {
      const { data } = await api.post('/api/auth/refresh', { refresh_token: refresh })
      get().setTokens(data.access_token, null)
      return data.access_token
    } catch {
      get().logout()
      return null
    }
  },

  getValidToken: async () => {
    if (get().isTokenExpired()) {
      return await get().refreshAccessToken()
    }
    return get().accessToken
  },
}))