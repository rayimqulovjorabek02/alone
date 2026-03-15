// src/components/chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Paperclip, Square } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function ChatInput({ onSend, isDisabled }) {
  const [text,        setText]        = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isFocused,   setIsFocused]   = useState(false)
  const textareaRef = useRef(null)
  const mediaRef    = useRef(null)
  const chunksRef   = useRef([])

  // Textarea balandligini matn hajmiga qarab avtomatik o'zgartirish
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  const handleSend = () => {
    if (!text.trim() || isDisabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRef.current?.stop()
      return
    }
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('audio', blob, 'recording.webm')
        try {
          const { data } = await api.post('/api/voice/stt', form)
          if (data.text) setText(prev => prev ? prev + ' ' + data.text : data.text)
        } catch {
          toast.error('Ovoz tanilmadi')
        }
        setIsRecording(false)
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch {
      toast.error('Mikrofon ruxsati kerak')
    }
  }

  const canSend = text.trim() && !isDisabled

  return (
    <div style={{
      padding:    '12px 16px 16px',
      borderTop:  '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      {/* Yozish maydoni */}
      <div style={{
        display:      'flex',
        alignItems:   'flex-end',
        gap:          '8px',
        background:   'var(--surface)',
        border:       `1px solid ${isFocused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-xl)',
        padding:      '8px 8px 8px 16px',
        transition:   'border-color .2s, box-shadow .2s',
        boxShadow:    isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
      }}>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isDisabled ? 'AI javob yozmoqda...' : 'Xabar yozing... (Enter — yuborish)'}
          disabled={isDisabled}
          rows={1}
          style={{
            flex:        1,
            background:  'none',
            border:      'none',
            color:       'var(--text)',
            fontSize:    '14px',
            resize:      'none',
            outline:     'none',
            lineHeight:  1.6,
            maxHeight:   '160px',
            fontFamily:  'var(--font)',
            padding:     '4px 0',
            overflowY:   'auto',
            opacity:     isDisabled ? 0.5 : 1,
          }}
        />

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', paddingBottom: '2px' }}>
          {/* Mikrofon */}
          <button
            onClick={toggleRecording}
            title={isRecording ? 'To\'xtatish' : 'Ovozli xabar'}
            style={{
              width:          34,
              height:         34,
              borderRadius:   'var(--r-md)',
              border:         'none',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     isRecording ? 'var(--error-soft)' : 'transparent',
              color:          isRecording ? 'var(--error)' : 'var(--text3)',
              transition:     'all .15s',
              animation:      isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {isRecording ? <Square size={15} /> : <Mic size={17} />}
          </button>

          {/* Yuborish */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            title="Yuborish (Enter)"
            style={{
              width:          34,
              height:         34,
              borderRadius:   'var(--r-md)',
              border:         'none',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              background:     canSend ? 'var(--accent)' : 'var(--surface2)',
              color:          canSend ? 'white' : 'var(--text3)',
              transition:     'all .15s',
              boxShadow:      canSend ? '0 2px 8px var(--accent-glow)' : 'none',
              cursor:         canSend ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} style={{ marginLeft: '1px' }} />
          </button>
        </div>
      </div>

      {/* Qisqa yo'riqnoma */}
      <div style={{
        display:        'flex',
        justifyContent: 'center',
        marginTop:      '8px',
        gap:            '16px',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
          <kbd style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Enter</kbd>
          {' '}yuborish
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
          <kbd style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Shift+Enter</kbd>
          {' '}yangi qator
        </span>
      </div>
    </div>
  )
}