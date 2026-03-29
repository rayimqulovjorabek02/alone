// src/hooks/useTTS.js
// Backend edge-tts + Web Speech API fallback
import { useState, useRef, useEffect } from 'react'
import { useSettingsStore }            from '../store/settingsStore'

// Matnni TTS uchun tozalash
function cleanText(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' kod bloki ')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/#+\s*/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/[_~>|#]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}]/gu, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
}

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef    = useRef(null)
  const uttRef      = useRef(null)
  const keepAlive   = useRef(null)
  const voicesRef   = useRef([])
  const settings    = useSettingsStore(s => s.settings)

  // Web Speech API ovozlarini yuklash
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() || [] }
    load()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  // ── Backend TTS (edge-tts) ──────────────────────────────────
  const speakBackend = async (text, lang = 'uz') => {
    try {
      const token   = localStorage.getItem('access_token')
      if (!token) return false

      const gender  = settings?.tts_voice || 'default'

      const resp = await fetch('/api/voice/tts', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text, lang, gender, speed: 'normal' }),
      })

      if (!resp.ok) return false

      const data     = await resp.json()
      const audio_b64 = data.audio_b64 || data.audio
      if (!audio_b64) return false

      // Base64 → Audio
      const bytes    = atob(audio_b64)
      const arr      = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
      const blob     = new Blob([arr], { type: 'audio/mpeg' })
      const url      = URL.createObjectURL(blob)

      const audio    = new Audio(url)
      audioRef.current = audio

      audio.onplay  = () => { setIsLoading(false); setIsPlaying(true) }
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setIsPlaying(false); setIsLoading(false) }

      await audio.play()
      return true
    } catch (e) {
      console.warn('[TTS] Backend xato:', e)
      return false
    }
  }

  // ── Web Speech API fallback ────────────────────────────────
  const speakBrowser = (text, lang = 'uz') => {
    const voices   = voicesRef.current
    const langMap  = {
      uz: ['uz', 'ru'], ru: ['ru'], en: ['en-GB', 'en-US'],
      tr: ['tr'], ar: ['ar'], de: ['de'], fr: ['fr'],
      es: ['es'], zh: ['zh-CN', 'zh'], ja: ['ja'], ko: ['ko'],
    }
    const preferred = langMap[lang] || [lang, 'en']

    const getBest = () => {
      for (const l of preferred) {
        const g = voices.find(v => v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith(l))
        if (g) return g
      }
      for (const l of preferred) {
        const m = voices.find(v => v.name.toLowerCase().includes('microsoft') && v.lang.toLowerCase().startsWith(l))
        if (m) return m
      }
      for (const l of preferred) {
        const a = voices.find(v => v.lang.toLowerCase().startsWith(l))
        if (a) return a
      }
      return null
    }

    const utt     = new SpeechSynthesisUtterance(text)
    uttRef.current = utt
    const voice   = getBest()
    if (voice) { utt.voice = voice; utt.lang = voice.lang }
    else utt.lang = lang === 'uz' ? 'ru-RU' : lang

    utt.rate   = 0.9
    utt.pitch  = 1.05
    utt.volume = 1.0

    utt.onstart = () => { setIsLoading(false); setIsPlaying(true) }
    const onEnd = () => {
      clearInterval(keepAlive.current)
      setIsPlaying(false); setIsLoading(false)
      uttRef.current = null
    }
    utt.onend   = onEnd
    utt.onerror = (e) => { if (e.error !== 'interrupted') console.warn('TTS:', e.error); onEnd() }

    keepAlive.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause(); window.speechSynthesis.resume()
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive.current)
      }
    }, 10000)

    window.speechSynthesis.speak(utt)
  }

  // ── Asosiy speak funksiyasi ────────────────────────────────
  const speak = async (text, lang = 'uz') => {
    if (!text?.trim()) return
    stop()
    setIsLoading(true)

    const clean = cleanText(text)
    if (!clean) { setIsLoading(false); return }

    // Avval backend TTS sinab ko'r
    const backendOk = await speakBackend(clean, lang)

    // Agar backend ishlamasa — brauzer TTS
    if (!backendOk) {
      if (window.speechSynthesis) {
        speakBrowser(clean, lang)
      } else {
        setIsLoading(false)
      }
    }
  }

  const stop = () => {
    clearInterval(keepAlive.current)
    // Audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    // Web Speech
    window.speechSynthesis?.cancel()
    uttRef.current = null
    setIsPlaying(false)
    setIsLoading(false)
  }

  return { speak, stop, isPlaying, isLoading }
}