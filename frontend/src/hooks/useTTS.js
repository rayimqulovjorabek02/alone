// src/hooks/useTTS.js
// Web Speech API — server kerak emas, brauzer o'zi o'qiydi
import { useState, useRef } from 'react'

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const uttRef = useRef(null)

  const speak = (text, voice = 'default') => {
    if (!text || !text.trim()) return
    if (!window.speechSynthesis) {
      console.warn('Web Speech API qo\'llab-quvvatlanmaydi')
      return
    }

    // Avvalgi ovozni to'xtatish
    stop()

    setIsLoading(true)

    // Matnni tozalash (markdown, emoji olib tashlash)
    const clean = text
      .replace(/```[\s\S]*?```/g, ' kod bloki. ')
      .replace(/`[^`]+`/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/[_~>|]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)

    const utt = new SpeechSynthesisUtterance(clean)
    uttRef.current = utt

    // Til va ovoz tanlash
    const langMap = { default: 'uz-UZ', male: 'uz-UZ', female: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }
    utt.lang = langMap[voice] || 'uz-UZ'
    utt.rate = 0.95
    utt.pitch = 1.0
    utt.volume = 1.0

    // Mavjud ovozlardan mosini topish
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]))
    if (match) utt.voice = match

    utt.onstart  = () => { setIsLoading(false); setIsPlaying(true) }
    utt.onend    = () => { setIsPlaying(false); uttRef.current = null }
    utt.onerror  = (e) => {
      console.error('TTS xato:', e)
      setIsPlaying(false)
      setIsLoading(false)
      uttRef.current = null
    }

    // Chrome bug: 15 sekunddan keyin to'xtab qoladi — keep-alive
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      } else {
        clearInterval(keepAlive)
      }
    }, 10000)

    utt.onend = () => {
      clearInterval(keepAlive)
      setIsPlaying(false)
      uttRef.current = null
    }

    setIsLoading(false)
    window.speechSynthesis.speak(utt)
    setIsPlaying(true)
  }

  const stop = () => {
    window.speechSynthesis?.cancel()
    uttRef.current = null
    setIsPlaying(false)
    setIsLoading(false)
  }

  return { speak, stop, isPlaying, isLoading }
}