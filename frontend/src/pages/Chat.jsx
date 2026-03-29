// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react'
import { useChatStore }   from '../store/chatStore'
import { useAuthStore }   from '../store/authStore'
import { useLang }        from '../i18n/LanguageContext'
import { ChatSocket }     from '../api/chat'
import ChatWindow         from '../components/chat/ChatWindow'
import ChatInput          from '../components/chat/ChatInput'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Chat() {
  const {
    sessions, sessionId, messages, isStreaming,
    loadSessions, newSession, deleteSession,
    loadHistory, addMessage,
    updateLastAssistant, setStreaming,
  } = useChatStore()

  const { user }    = useAuthStore()
  const { t, lang } = useLang()
  const socketRef   = useRef(null)
  const mountedRef  = useRef(true)
  const [model, setModel] = useState('llama-3.3-70b-versatile')

  useEffect(() => {
    mountedRef.current = true
    loadSessions()

    const socket = new ChatSocket({
      onStart: () => {
        if (mountedRef.current) setStreaming(true)
      },
      onChunk: (content) => {
        if (!mountedRef.current) return
        updateLastAssistant(
          (useChatStore.getState().messages.at(-1)?.content || '') + content
        )
      },
      onDone: (data) => {
        if (!mountedRef.current) return
        setStreaming(false)
        if (data.session_id) {
          const sid = useChatStore.getState().sessionId
          if (!sid) useChatStore.getState().setSessionId(data.session_id)
        }
        loadSessions()
      },
      onError: (msg) => {
        if (!mountedRef.current) return
        setStreaming(false)
        toast.error(msg)
        if (msg.includes('limit') || msg.includes('tugadi') || msg.includes('лимит')) {
          setTimeout(() => navigate('/premium'), 2500)
        }
      },
      onSessionCreated: (id) => {
        if (!mountedRef.current) return
        useChatStore.getState().setSessionId(id)
        loadSessions()
      },
    })

    socket.connect()
      .then(() => {
        if (mountedRef.current) {
          socketRef.current = socket
        } else {
          socket.disconnect()
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          toast.error(t('networkError'))
        }
      })

    return () => {
      mountedRef.current = false
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (text) => {
    if (!text.trim() || isStreaming) return
    addMessage('user', text)
    addMessage('assistant', '')
    socketRef.current?.send(text, sessionId || 0, model)
  }

  const handleNewChat = async () => {
    const id = await newSession()
    if (id) useChatStore.getState().setSessionId(id)
  }

  const handleSelectSession = (id) => {
    if (id !== sessionId) loadHistory(id)
  }

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation()
    await deleteSession(id)
    toast.success(t('deleteSession'))
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Sessiyalar paneli ──────────────────────────────────── */}
      <div style={{
        width:         '240px',
        minWidth:      '240px',
        background:    'var(--surface)',
        borderRight:   '1px solid var(--border)',
        display:       'flex',
        flexDirection: 'column',
      }}>
        {/* Yangi suhbat tugmasi */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={handleNewChat}
            style={{
              width:          '100%',
              padding:        '9px',
              borderRadius:   'var(--r-md)',
              border:         '1px solid var(--border)',
              cursor:         'pointer',
              background:     'var(--surface2)',
              color:          'var(--text2)',
              fontSize:       '13px',
              fontWeight:     600,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
              fontFamily:     'var(--font)',
              transition:     'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Plus size={15} />
            {t('newChat')}
          </button>
        </div>

        {/* Sessiyalar ro'yxati */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => handleSelectSession(s.id)}
              style={{
                padding:        '9px 10px',
                borderRadius:   'var(--r-md)',
                cursor:         'pointer',
                marginBottom:   '2px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                gap:            '6px',
                background:     sessionId === s.id ? 'rgba(124,58,237,.15)' : 'transparent',
                border:         sessionId === s.id ? '1px solid rgba(124,58,237,.3)' : '1px solid transparent',
                transition:     'background .15s',
              }}
              onMouseEnter={e => {
                if (sessionId !== s.id) e.currentTarget.style.background = 'var(--surface2)'
              }}
              onMouseLeave={e => {
                if (sessionId !== s.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '7px',
                overflow:     'hidden',
                flex:         1,
                minWidth:     0,
              }}>
                <MessageSquare size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                <span style={{
                  fontSize:     '12px',
                  color:        sessionId === s.id ? 'var(--text)' : 'var(--text2)',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}>
                  {s.title || t('newChat')}
                </span>
              </div>

              <button
                onClick={e => handleDeleteSession(e, s.id)}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      'var(--text3)',
                  padding:    '2px',
                  flexShrink: 0,
                  opacity:    0.6,
                  transition: 'opacity .15s, color .15s',
                  display:    'flex',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color   = 'var(--error)'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color   = 'var(--text3)'
                  e.currentTarget.style.opacity = '0.6'
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat maydoni ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Model tanlash */}
        <div style={{
          padding:      '10px 16px',
          borderBottom: '1px solid var(--border)',
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
        }}>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            style={{
              background:   'var(--surface2)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              color:        'var(--text2)',
              padding:      '5px 10px',
              fontSize:     '12px',
              cursor:       'pointer',
              fontFamily:   'var(--font)',
            }}
          >
            <option value="llama-3.3-70b-versatile">🦙 Llama 3.3 70B</option>
            <option value="llama-3.1-8b-instant">⚡ Llama 3.1 8B (Tez)</option>
            <option value="mixtral-8x7b-32768">🌀 Mixtral 8x7B</option>
          </select>

          <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
            {user?.plan === 'free'
              ? `50 ${ lang === 'uz' ? 'xabar/kun' : lang === 'ru' ? 'сообщ/день' : 'msg/day' }`
              : user?.plan
            }
          </span>

          {isStreaming && (
            <span style={{
              fontSize:  '12px',
              color:     '#a78bfa',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              {t('aiTyping')}
            </span>
          )}
        </div>

        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <ChatInput  onSend={handleSend} isDisabled={isStreaming} />
      </div>
    </div>
  )
}