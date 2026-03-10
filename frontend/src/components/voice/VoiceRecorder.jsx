// src/components/voice/VoiceRecorder.jsx
import { useState, useRef } from 'react'
import { Mic, MicOff, Volume2, Square } from 'lucide-react'

export default function VoiceRecorder({ onTranscript, onAudio }) {
  const [state, setState]     = useState('idle') // idle | recording | processing
  const [waveform, setWave]   = useState([])
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const animRef   = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr     = new MediaRecorder(stream)
      chunksRef.current = []

      // Waveform animation
      const ctx  = new (window.AudioContext || window.webkitAudioContext)()
      const src  = ctx.createMediaStreamSource(stream)
      const anal = ctx.createAnalyser()
      anal.fftSize = 64
      src.connect(anal)
      const buf = new Uint8Array(anal.frequencyBinCount)
      const tick = () => {
        anal.getByteFrequencyData(buf)
        setWave(Array.from(buf.slice(0, 12)))
        animRef.current = requestAnimationFrame(tick)
      }
      tick()

      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        cancelAnimationFrame(animRef.current)
        setWave([])
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        onAudio?.(blob)
        stream.getTracks().forEach(t => t.stop())
        ctx.close()
        setState('idle')
      }

      mr.start()
      mediaRef.current = mr
      setState('recording')
    } catch {
      alert("Mikrofon ruxsati kerak")
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setState('processing')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Waveform */}
      {state === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '40px' }}>
          {waveform.map((v, i) => (
            <div key={i} style={{
              width: '4px',
              height: `${Math.max(4, (v / 255) * 40)}px`,
              background: `rgba(102,51,238,${0.4 + (v/255) * 0.6})`,
              borderRadius: '2px',
              transition: 'height .1s ease',
            }} />
          ))}
        </div>
      )}

      {/* Button */}
      <button
        onClick={state === 'recording' ? stopRecording : startRecording}
        disabled={state === 'processing'}
        style={{
          width: '64px', height: '64px', borderRadius: '50%', border: 'none',
          background: state === 'recording'
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #6633ee, #4f46e5)',
          color: 'white', cursor: state === 'processing' ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: state === 'recording'
            ? '0 0 0 8px rgba(239,68,68,.2), 0 8px 24px rgba(239,68,68,.4)'
            : '0 8px 24px rgba(102,51,238,.4)',
          transition: 'all .3s',
          animation: state === 'recording' ? 'pulse-glow 1.5s ease infinite' : 'none',
        }}
      >
        {state === 'recording'   ? <Square size={24} /> :
         state === 'processing'  ? <Volume2 size={24} /> :
                                   <Mic size={24} />}
      </button>

      <p style={{ fontSize: '12px', color: 'var(--text3)' }}>
        {state === 'idle'       && 'Bosing va gapiring'}
        {state === 'recording'  && '🔴 Yozib olinmoqda...'}
        {state === 'processing' && '⏳ Qayta ishlanmoqda...'}
      </p>
    </div>
  )
}