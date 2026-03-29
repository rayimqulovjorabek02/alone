// src/components/chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react'
import api                             from '../../api/client'
import toast                           from 'react-hot-toast'
import { useLang }                     from '../../i18n/LanguageContext'
import { Send, Mic, MicOff }           from 'lucide-react'

export default function ChatInput({ onSend, isDisabled }) {
  const [text,      setText]      = useState('')
  const [recording, setRecording] = useState(false)
  const [focused,   setFocused]   = useState(false)
  const textareaRef               = useRef(null)
  const mediaRef                  = useRef(null)
  const chunksRef                 = useRef([])
  const { lang }                  = useLang()

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
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
    if (recording) {
      mediaRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr     = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('file', blob, 'audio.webm')
        form.append('lang', lang || 'uz')
        try {
          const { data } = await api.post('/api/voice/stt', form)
          if (data.text) setText(prev => prev + (prev ? ' ' : '') + data.text)
        } catch {
          toast.error(lang === 'ru' ? 'Ошибка распознавания' : lang === 'en' ? 'Recognition error' : "Ovoz tanilmadi")
        }
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch {
      toast.error(lang === 'ru' ? 'Микрофон недоступен' : lang === 'en' ? 'Mic unavailable' : "Mikrofon yo'q")
    }
  }

  const canSend     = text.trim() && !isDisabled
  const placeholder = isDisabled
    ? (lang === 'ru' ? 'AI печатает...'            : lang === 'en' ? 'AI is typing...'          : 'AI javob yozmoqda...')
    : (lang === 'ru' ? 'Напишите... (Enter — отп.)': lang === 'en' ? 'Type... (Enter to send)'  : 'Xabar yozing... (Enter — yuborish)')

  return (
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{
        display:      'flex',
        alignItems:   'flex-end',
        gap:          '8px',
        background:   'var(--surface)',
        border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-xl)',
        padding:      '8px 10px 8px 14px',
        transition:   'border-color .2s, box-shadow .2s',
        boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          style={{
            flex:       1,
            background: 'transparent',
            border:     'none',
            outline:    'none',
            resize:     'none',
            color:      'var(--text)',
            fontSize:   '14px',
            lineHeight: 1.6,
            fontFamily: 'var(--font)',
            maxHeight:  '160px',
            overflowY:  'auto',
            opacity:    isDisabled ? 0.5 : 1,
            padding:    '2px 0',
          }}
        />

        <button
          onClick={toggleRecording}
          disabled={isDisabled}
          style={{
            width:          32, height: 32,
            borderRadius:   'var(--r-md)',
            border:         'none',
            cursor:         isDisabled ? 'not-allowed' : 'pointer',
            background:     recording ? 'rgba(239,68,68,0.15)' : 'transparent',
            color:          recording ? '#ef4444' : 'var(--text3)',
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink:     0, transition: 'all .15s',
          }}
        >
          {recording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width:          32, height: 32,
            borderRadius:   'var(--r-md)',
            border:         'none',
            cursor:         !canSend ? 'not-allowed' : 'pointer',
            background:     canSend ? 'var(--accent)' : 'transparent',
            color:          canSend ? 'white' : 'var(--text3)',
            display:        'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink:     0, transition: 'all .15s',
            boxShadow:      canSend ? '0 2px 8px var(--accent-glow)' : 'none',
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text3)', paddingLeft: '4px' }}>
        <span>
          <kbd style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Enter</kbd>
          {' '}{ lang === 'ru' ? '— отправить' : lang === 'en' ? '— send' : '— yuborish' }
        </span>
        <span>
          <kbd style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Shift+Enter</kbd>
          {' '}{ lang === 'ru' ? '— новая строка' : lang === 'en' ? '— new line' : '— yangi qator' }
        </span>
      </div>
    </div>
  )
}