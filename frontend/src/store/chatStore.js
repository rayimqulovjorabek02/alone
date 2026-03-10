// src/store/chatStore.js
import { create } from 'zustand'
import api from '../api/client'

export const useChatStore = create((set, get) => ({
  sessions:     [],
  sessionId:    null,
  messages:     [],
  isLoading:    false,
  isStreaming:  false,
  streamBuffer: '',

  // Sessiyalar
  loadSessions: async () => {
    const { data } = await api.get('/api/chat/sessions')
    set({ sessions: data || [] })
  },

  newSession: async () => {
    const { data } = await api.post('/api/chat/sessions')
    set((s) => ({
      sessions:  [data, ...s.sessions],
      sessionId: data.id,
      messages:  [],
    }))
    return data.id
  },

  setSessionId: (id) => set({ sessionId: id }),

  deleteSession: async (id) => {
    await api.delete(`/api/chat/sessions/${id}`)
    set((s) => ({
      sessions:  s.sessions.filter((s) => s.id !== id),
      sessionId: s.sessionId === id ? null : s.sessionId,
      messages:  s.sessionId === id ? [] : s.messages,
    }))
  },

  loadHistory: async (sessionId) => {
    set({ isLoading: true, sessionId, messages: [] })
    try {
      const { data } = await api.get(`/api/chat/sessions/${sessionId}/messages`)
      set({ messages: data || [] })
    } finally {
      set({ isLoading: false })
    }
  },

  // Xabar qo'shish (UI uchun)
  addMessage: (role, content) => {
    set((s) => ({
      messages: [...s.messages, { role, content, created_at: new Date().toISOString() }],
    }))
  },

  updateLastAssistant: (content) => {
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content }
      } else {
        msgs.push({ role: 'assistant', content, created_at: new Date().toISOString() })
      }
      return { messages: msgs }
    })
  },

  updateSessionTitle: (id, title) => {
    set((s) => ({
      sessions: s.sessions.map((ses) => ses.id === id ? { ...ses, title } : ses),
    }))
  },

  setStreaming: (val) => set({ isStreaming: val }),
  setLoading:   (val) => set({ isLoading: val }),
  clearMessages: ()   => set({ messages: [], sessionId: null }),
}))