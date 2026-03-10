// src/pages/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { ChatSocket } from '../api/chat'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Chat() {
  const {
    sessions, sessionId, messages, isStreaming,
    loadSessions, newSession, deleteSession,
    loadHistory, setSessionId, addMessage,
    updateLastAssistant, setStreaming, updateSessionTitle
  } = useChatStore()

  const { user }    = useAuthStore()
  const socketRef   = useRef(null)
  const [model, setModel] = useState('llama-3.3-70b-versatile')

  // WebSocket ulanish
  useEffect(() => {
    loadSessions()
    connectSocket()
    return () => socketRef.current?.disconnect()
  }, [])

  const connectSocket = async () => {
    const socket = new ChatSocket({
      onStart:          ()        => setStreaming(true),
      onChunk:          (content) => updateLastAssistant(
        (useChatStore.getState().messages.at(-1)?.content || '') + content
      ),
      onDone:           (data)    => {
        setStreaming(false)
        if (data.session_id) {
          const sid = useChatStore.getState().sessionId
          if (!sid) useChatStore.getState().setSessionId(data.session_id)
        }
        loadSessions()
      },
      onError:          (msg)     => { setStreaming(false); toast.error(msg) },
      onSessionCreated: (id)      => {
        useChatStore.getState().setSessionId(id)
        loadSessions()
      },
    })
    try {
      await socket.connect()
      socketRef.current = socket
    } catch (e) {
      toast.error("Chat ulanmadi. Sahifani yangilang.")
    }
  }

  const handleSend = (text) => {
    if (!text.trim() || isStreaming) return
    addMessage('user', text)
    addMessage('assistant', '')
    socketRef.current?.send(text, sessionId || 0, model)
  }

  const handleNewChat = async () => {
    const id = await newSession()
    socketRef.current?.send('', id, model)
  }

  const handleSelectSession = (id) => {
    if (id !== sessionId) loadHistory(id)
  }

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation()
    await deleteSession(id)
    toast.success("Suhbat o'chirildi")
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Sessions panel */}
      <div style={{ width:'240px', minWidth:'240px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px' }}>
          <button onClick={handleNewChat}
            style={{ width:'100%', padding:'9px', borderRadius:'10px', border:'1px solid var(--border)', cursor:'pointer', background:'var(--surface2)', color:'var(--text2)', fontSize:'13px', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            <Plus size={15}/> Yangi suhbat
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 8px 8px' }}>
          {sessions.map(s => (
            <div key={s.id} onClick={()=>handleSelectSession(s.id)}
              style={{ padding:'9px 10px', borderRadius:'10px', cursor:'pointer', marginBottom:'2px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'6px',
                background: sessionId===s.id ? 'rgba(124,58,237,.15)' : 'transparent',
                border: sessionId===s.id ? '1px solid rgba(124,58,237,.3)' : '1px solid transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px', overflow:'hidden', flex:1, minWidth:0 }}>
                <MessageSquare size={13} style={{ color:'var(--text3)', flexShrink:0 }}/>
                <span style={{ fontSize:'12px', color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.title}</span>
              </div>
              <button onClick={e=>handleDeleteSession(e,s.id)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'2px', flexShrink:0, opacity:0.6 }}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Model selector */}
        <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
          <select value={model} onChange={e=>setModel(e.target.value)}
            style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text2)', padding:'5px 10px', fontSize:'12px', cursor:'pointer' }}>
            <option value="llama-3.3-70b-versatile">🦙 Llama 3.3 70B</option>
            <option value="llama-3.1-8b-instant">⚡ Llama 3.1 8B (Tez)</option>
            <option value="mixtral-8x7b-32768">🌀 Mixtral 8x7B</option>
          </select>
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>
            {user?.plan === 'free' ? `50 xabar/kun` : user?.plan}
          </span>
        </div>

        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <ChatInput onSend={handleSend} isDisabled={isStreaming} />
      </div>
    </div>
  )
}