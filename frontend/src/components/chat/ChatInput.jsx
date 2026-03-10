// src/components/chat/ChatInput.jsx
import { useState, useRef } from 'react'
import { Send, Mic, MicOff, Paperclip } from 'lucide-react'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function ChatInput({ onSend, isDisabled }) {
  const [text,        setText]        = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])

  const handleSend = () => {
    if (!text.trim() || isDisabled) return
    onSend(text)
    setText('')
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
          if (data.text) setText(data.text)
        } catch { toast.error("Ovoz tanilmadi") }
        setIsRecording(false)
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch { toast.error("Mikrofon ruxsati kerak") }
  }

  return (
    <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'8px 8px 8px 14px', transition:'border-color .2s' }}>
        <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
          rows={1}
          style={{ flex:1, background:'none', border:'none', color:'var(--text)', fontSize:'14px', resize:'none', outline:'none', lineHeight:1.6, maxHeight:'120px', fontFamily:'inherit', padding:'3px 0' }} />
        <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
          <button onClick={toggleRecording}
            style={{ width:36, height:36, borderRadius:'10px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              background: isRecording ? 'rgba(248,113,113,.15)' : 'transparent',
              color: isRecording ? '#f87171' : 'var(--text3)' }}>
            {isRecording ? <MicOff size={18}/> : <Mic size={18}/>}
          </button>
          <button onClick={handleSend} disabled={!text.trim() || isDisabled}
            style={{ width:36, height:36, borderRadius:'10px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              background: text.trim() && !isDisabled ? 'var(--accent)' : 'var(--surface2)',
              color: text.trim() && !isDisabled ? 'white' : 'var(--text3)' }}>
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  )
}