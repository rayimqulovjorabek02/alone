// src/store/settingsStore.js
// Til o'zgartirilganda localStorage va LanguageContext ham yangilanadi
import { create } from 'zustand'
import api from '../api/client'

export const useSettingsStore = create((set) => ({
  settings: {
    name:          '',
    language:      localStorage.getItem('lang') || 'uz',
    chat_language: localStorage.getItem('lang') || 'uz',
    ai_style:      'friendly',
    theme:         'dark',
    temperature:   0.7,
    tts_voice:     'default',
  },
  loaded: false,

  load: async () => {
    try {
      const { data } = await api.get('/api/settings')
      // Serverdan kelgan tilni localStorage ga ham yozamiz
      if (data.language) {
        localStorage.setItem('lang', data.language)
        document.documentElement.lang = data.language
      }
      set({ settings: data, loaded: true })
    } catch {}
  },

  save: async (updates) => {
    const { data } = await api.put('/api/settings', updates)
    // Til o'zgartirilgan bo'lsa — localStorage va html lang ni yangilash
    if (updates.language) {
      localStorage.setItem('lang', updates.language)
      document.documentElement.lang = updates.language
      // LanguageContext ni reload qilmasdan yangilash uchun event chiqaramiz
      window.dispatchEvent(new CustomEvent('lang-change', { detail: updates.language }))
    }
    set((s) => ({ settings: { ...s.settings, ...updates } }))
    return data
  },

  update: (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }))
  },
}))