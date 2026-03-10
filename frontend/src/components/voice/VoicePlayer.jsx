// src/components/voice/VoicePlayer.jsx
import { useState, useRef } from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { voiceAPI } from '../../api/voice'

export default function VoicePlayer({ text, lang = 'uz' }) {
  const [state, setState] = useState('idle') // idle | loading | playing | paused
  const audioRef = useRef(null)

  const play = async () => {
    if (state === 'playing') {
      audioRef.current?.pause()
      setState('paused')
      return
    }
    if (state === 'paused') {
      audioRef.current?.play()
      setState('playing')
      return
    }

    setState('loading')
    try {
      const { data } = await voiceAPI.tts(text, lang)
      const url = URL.createObjectURL(data)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => { setState('idle'); URL.revokeObjectURL(url) }
      await audio.play()
      setState('playing')
    } catch {
      setState('idle')
    }
  }

  const stop = () => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setState('idle')
  }

  const icons = {
    idle:    <Volume2 size={13} />,
    loading: <span style={{ fontSize: '10px' }}>⏳</span>,
    playing: <Pause size={13} />,
    paused:  <Play size={13} />,
  }

  return (
    <button
      onClick={play}
      title={state === 'playing' ? 'Pauza' : 'Tinglash'}
      style={{
        background: state === 'playing' ? 'rgba(102,51,238,.2)' : 'none',
        border: 'none', color: state === 'playing' ? '#a78bfa' : 'var(--text3)',
        cursor: 'pointer', padding: '3px 6px', borderRadius: '4px',
        display: 'flex', alignItems: 'center', gap: '3px',
        fontSize: '11px', transition: 'all .2s',
      }}
    >
      {icons[state]}
      {state === 'loading' ? 'Yuklanmoqda' : state === 'playing' ? 'Pauza' : 'Eshit'}
    </button>
  )
}