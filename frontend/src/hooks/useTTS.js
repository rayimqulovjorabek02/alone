// src/hooks/useTTS.js
import { useState, useRef } from 'react'
import api from '../api/client'

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(null)

  const speak = async (text, voice = 'default') => {
    if (!text.trim()) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsLoading(true)
    try {
      const { data } = await api.post('/api/voice/tts', { text, voice })
      if (!data.audio_b64) return

      const bytes  = Uint8Array.from(atob(data.audio_b64), c => c.charCodeAt(0))
      const blob   = new Blob([bytes], { type: 'audio/mpeg' })
      const url    = URL.createObjectURL(blob)
      const audio  = new Audio(url)
      audioRef.current = audio

      audio.onplay  = () => setIsPlaying(true)
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => setIsPlaying(false)
      audio.play()
    } catch (e) {
      console.error('TTS xato:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }

  return { speak, stop, isPlaying, isLoading }
}