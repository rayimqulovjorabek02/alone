// src/api/export.js
import api from './client'

export const exportChat = async (sessionId, format = 'txt') => {
  const res = await api.get(`/api/export/chat/${sessionId}?format=${format}`, {
    responseType: 'blob'
  })
  const url      = URL.createObjectURL(res.data)
  const a        = document.createElement('a')
  a.href         = url
  a.download     = `suhbat.${format}`
  a.click()
  URL.revokeObjectURL(url)
}