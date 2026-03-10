// src/api/voice.js
import api from './client'

export const textToSpeech = (text, voice = 'default') =>
  api.post('/api/voice/tts', { text, voice })

export const speechToText = (audioBlob) => {
  const form = new FormData()
  form.append('audio', audioBlob, 'recording.webm')
  return api.post('/api/voice/stt', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const translate = (text, from_lang = 'auto', to_lang = 'uz') =>
  api.post('/api/voice/translate', { text, from_lang, to_lang })

export const playAudio = (base64: string) => {
  const bytes  = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  const blob   = new Blob([bytes], { type: 'audio/mpeg' })
  const url    = URL.createObjectURL(blob)
  const audio  = new Audio(url)
  audio.play()
  return audio
}