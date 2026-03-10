// src/store/settingsStore.js
import { create } from 'zustand'
import api from '../api/client'

export const useSettingsStore = create((set) => ({
  settings: {
    name:        '',
    language:    'uz',
    ai_style:    'friendly',
    theme:       'dark',
    temperature: 0.7,
    tts_voice:   'default',
  },
  loaded: false,

  load: async () => {
    try {
      const { data } = await api.get('/api/settings')
      set({ settings: data, loaded: true })
    } catch {}
  },

  save: async (updates) => {
    const { data } = await api.put('/api/settings', updates)
    set((s) => ({ settings: { ...s.settings, ...updates } }))
    return data
  },

  update: (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }))
  },
}))