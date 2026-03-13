// src/hooks/useVoice.js
import { useState, useRef, useCallback } from 'react'
import api from '../api/client'

export function useVoice() {
  const [speaking,  setSpeaking]  = useState(false)
  const [listening, setListening] = useState(false)
  const [error,     setError]     = useState('')

  const audioRef  = useRef(null)
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const recognRef = useRef(null)
  // speaking/listening ni ref orqali tutish — stale closure oldini olish
  const speakingRef  = useRef(false)
  const listeningRef = useRef(false)

  const setSpeakingBoth = (val) => { speakingRef.current = val; setSpeaking(val) }
  const setListeningBoth = (val) => { listeningRef.current = val; setListening(val) }

  // ── TTS ──────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setSpeakingBoth(false)
  }, [])

  const speak = useCallback(async (text, options = {}) => {
    if (!text?.trim()) return
    if (speakingRef.current) stopSpeaking()

    setError('')
    setSpeakingBoth(true)

    const clean = text
      .replace(/```[\s\S]*?```/g, ' kod bloki. ')
      .replace(/`[^`]*`/g, '')
      .replace(/[#*_~>|[\]()]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2000)

    try {
      const response = await api.post('/api/voice/tts', {
        text:   clean,
        lang:   options.lang   || 'uz',
        gender: options.gender || 'default',
        speed:  options.speed  || 'normal',
      }, { responseType: 'blob' })

      const blob  = new Blob([response.data], { type: 'audio/mpeg' })
      const url   = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => { setSpeakingBoth(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setSpeakingBoth(false); URL.revokeObjectURL(url); _browserTTS(clean, options.lang || 'uz') }

      await audio.play()
    } catch {
      setSpeakingBoth(false)
      _browserTTS(clean, options.lang || 'uz')
    }
  }, [stopSpeaking])  // faqat stopSpeaking — stable ref

  const _browserTTS = (text, lang) => {
    if (!window.speechSynthesis) return
    const utt   = new SpeechSynthesisUtterance(text)
    utt.lang    = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ'
    utt.rate    = 0.95
    utt.pitch   = 1.0
    utt.volume  = 1.0
    const voices = window.speechSynthesis.getVoices()
    const best   = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]))
    if (best) utt.voice = best
    utt.onstart = () => setSpeakingBoth(true)
    utt.onend   = () => setSpeakingBoth(false)
    window.speechSynthesis.speak(utt)
  }

  // ── STT ──────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
    if (recognRef.current) recognRef.current.stop()
    setListeningBoth(false)
  }, [])

  const startListening = useCallback(async (options = {}) => {
    if (listeningRef.current) return
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount:     1,
          sampleRate:       16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,
        }
      })

      chunksRef.current = []
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })
      mediaRef.current = recorder

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setListeningBoth(false)
        if (!chunksRef.current.length) return

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        try {
          const res  = await api.post('/api/voice/stt', blob, {
            headers: { 'Content-Type': 'audio/webm', 'x-lang': options.lang || 'uz' }
          })
          const text = res.data?.text?.trim()
          if (text && options.onResult) options.onResult(text)
        } catch {
          _browserSTT(options)
        }
      }

      recorder.start(250)
      setListeningBoth(true)

    } catch {
      setError("Mikrofon ruxsati yo'q")
      setListeningBoth(false)
      _browserSTT(options)
    }
  }, [])  // bo'sh dependency — listeningRef orqali tekshiriladi

  const _browserSTT = (options = {}) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError("Brauzer STT qo'llab-quvvatlamaydi"); return }

    const rec = new SR()
    recognRef.current = rec
    rec.lang            = options.lang === 'ru' ? 'ru-RU' : options.lang === 'en' ? 'en-US' : 'uz-UZ'
    rec.continuous      = false
    rec.interimResults  = false
    rec.maxAlternatives = 1

    rec.onstart  = () => setListeningBoth(true)
    rec.onend    = () => setListeningBoth(false)
    rec.onerror  = () => setListeningBoth(false)
    rec.onresult = e => {
      const text = e.results[0][0].transcript
      if (text && options.onResult) options.onResult(text)
    }
    rec.start()
    setListeningBoth(true)
  }

  return {
    speak, stopSpeaking, speaking,
    startListening, stopListening, listening,
    error,
  }
}