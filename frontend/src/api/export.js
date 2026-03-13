// src/api/export.js
import api from './client'

// Blob yuklovchi helper
export const downloadBlob = (data, filename) => {
  const url = URL.createObjectURL(new Blob([data]))
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Eski — sessionId orqali (Chat.jsx da ishlatilgan bo'lishi mumkin)
export const exportChat = async (sessionId, format = 'txt') => {
  const res = await api.get(`/api/export/chat/${sessionId}?format=${format}`, {
    responseType: 'blob'
  })
  downloadBlob(res.data, `suhbat.${format}`)
}

// Yangi — messages array orqali (ChatExport.jsx ishlatadi)
export const exportAPI = {
  chatTxt:  (messages, title) => api.post('/api/export/chat/txt',  { messages, title }, { responseType: 'blob' }),
  chatMd:   (messages, title) => api.post('/api/export/chat/md',   { messages, title }, { responseType: 'blob' }),
  chatDocx: (messages, title) => api.post('/api/export/chat/docx', { messages, title }, { responseType: 'blob' }),
  chatPdf:  (messages, title) => api.post('/api/export/chat/pdf',  { messages, title }, { responseType: 'blob' }),
}