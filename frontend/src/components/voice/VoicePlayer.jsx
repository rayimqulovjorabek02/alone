// src/components/voice/VoicePlayer.jsx
import { useState, useRef } from 'react'
import { Volume2, Pause, Play } from 'lucide-react'

export default function VoicePlayer({ text, lang = 'uz' }) {
  const [state, setState] = useState('idle') // idle | loading | playing | paused
  const uttRef = useRef(null)

  const langMap = {
    uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US',
    tr: 'tr-TR', ar: 'ar-SA', de: 'de-DE',
    fr: 'fr-FR', es: 'es-ES', it: 'it-IT',
    zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR',
  }

  const play = () => {
    if (state === 'playing') {
      window.speechSynthesis.pause()
      setState('paused')
      return
    }
    if (state === 'paused') {
      window.speechSynthesis.resume()
      setState('playing')
      return
    }

    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    setState('loading')

    const clean = text
      .replace(/```[\s\S]*?```/g, ' kod bloki. ')
      .replace(/`[^`]+`/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)

    const utt = new SpeechSynthesisUtterance(clean)
    uttRef.current = utt
    utt.lang = langMap[lang] || 'uz-UZ'
    utt.rate = 0.95

    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]))
    if (match) utt.voice = match

    utt.onstart = () => setState('playing')
    utt.onend   = () => { setState('idle'); uttRef.current = null }
    utt.onerror = () => { setState('idle'); uttRef.current = null }

    window.speechSynthesis.speak(utt)
    setState('playing')
  }

  const stop = () => {
    window.speechSynthesis?.cancel()
    uttRef.current = null
    setState('idle')
  }

  const icons = {
    idle:    <Volume2 size={13} />,
    loading: <span style={{ fontSize: '10px' }}>⏳</span>,
    playing: <Pause size={13} />,
    paused:  <Play size={13} />,
  }

  return (
    <span style={{ display:'inline-flex', gap:'4px' }}>
      <button onClick={play}
        title={state === 'playing' ? 'Pauza' : 'Tinglash'}
        style={{
          background: state === 'playing' ? 'rgba(102,51,238,.2)' : 'none',
          border: 'none', color: state === 'playing' ? '#a78bfa' : 'var(--text3)',
          cursor: 'pointer', padding: '3px 6px', borderRadius: '4px',
          display: 'flex', alignItems: 'center', gap: '3px',
          fontSize: '11px', transition: 'all .2s',
        }}>
        {icons[state]}
        {state === 'loading' ? 'Yuklanmoqda' : state === 'playing' ? 'Pauza' : 'Eshit'}
      </button>
      {state !== 'idle' && (
        <button onClick={stop}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'3px', borderRadius:'4px', fontSize:'11px' }}>
          ✕
        </button>
      )}
    </span>
  )
}