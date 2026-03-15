// src/hooks/useTTS.js
// Web Speech API — yuqori sifat uchun optimallashtirilgan
import { useState, useRef, useEffect } from 'react'

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const uttRef    = useRef(null)
  const keepAlive = useRef(null)
  const voicesRef = useRef([])

  // Ovozlarni oldindan yuklash
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() || []
    }
    loadVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
  }, [])

  // Eng yaxshi ovozni tanlash
  const getBestVoice = (lang) => {
    const voices = voicesRef.current
    if (!voices.length) return null

    // Til xaritasi
    const langMap = {
      'uz': ['uz', 'ru'],  // uz yo'q bo'lsa ru
      'ru': ['ru'],
      'en': ['en-GB', 'en-US', 'en'],
      'tr': ['tr'],
      'ar': ['ar'],
      'de': ['de'],
      'fr': ['fr'],
      'es': ['es'],
      'it': ['it'],
      'zh': ['zh', 'zh-CN'],
      'ja': ['ja'],
      'ko': ['ko'],
    }

    const preferred = langMap[lang] || [lang, 'en']

    // 1. Google ovozi (eng sifatli)
    for (const l of preferred) {
      const google = voices.find(v =>
        v.name.toLowerCase().includes('google') &&
        v.lang.toLowerCase().startsWith(l.toLowerCase())
      )
      if (google) return google
    }

    // 2. Microsoft Neural ovozi
    for (const l of preferred) {
      const ms = voices.find(v =>
        v.name.toLowerCase().includes('microsoft') &&
        v.lang.toLowerCase().startsWith(l.toLowerCase())
      )
      if (ms) return ms
    }

    // 3. Istalgan mos ovoz
    for (const l of preferred) {
      const any = voices.find(v => v.lang.toLowerCase().startsWith(l.toLowerCase()))
      if (any) return any
    }

    return null
  }

  const speak = (text, lang = 'uz') => {
    if (!text?.trim()) return
    if (!window.speechSynthesis) {
      console.warn('Web Speech API qo\'llab-quvvatlanmaydi')
      return
    }

    stop()
    setIsLoading(true)

    // Matnni tozalash
    const clean = text
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
      .slice(0, 4000)

    if (!clean) { setIsLoading(false); return }

    const utt = new SpeechSynthesisUtterance(clean)
    uttRef.current = utt

    // Eng yaxshi ovozni tanlash
    const voice = getBestVoice(lang)
    if (voice) {
      utt.voice  = voice
      utt.lang   = voice.lang
    } else {
      utt.lang   = lang === 'uz' ? 'ru-RU' : (lang + '-' + lang.toUpperCase())
    }

    // Sifat sozlamalari
    utt.rate   = 0.9    // Biroz sekin — tiniqroq
    utt.pitch  = 1.05   // Tabiiy ovoz
    utt.volume = 1.0

    utt.onstart = () => {
      setIsLoading(false)
      setIsPlaying(true)
    }

    const onEnd = () => {
      clearInterval(keepAlive.current)
      setIsPlaying(false)
      setIsLoading(false)
      uttRef.current = null
    }

    utt.onend  = onEnd
    utt.onerror = (e) => {
      if (e.error !== 'interrupted') console.warn('TTS:', e.error)
      onEnd()
    }

    // Chrome 15s bug fix — keep-alive
    keepAlive.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive.current)
      }
    }, 10000)

    window.speechSynthesis.speak(utt)
  }

  const stop = () => {
    clearInterval(keepAlive.current)
    window.speechSynthesis?.cancel()
    uttRef.current = null
    setIsPlaying(false)
    setIsLoading(false)
  }

  const pause = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    }
  }

  const resume = () => {
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume()
      setIsPlaying(true)
    }
  }

  return { speak, stop, pause, resume, isPlaying, isLoading }
}