// src/components/chat/ChatWindow.jsx
import { useEffect, useRef } from 'react'
import MessageItem          from './MessageItem'
import { useLang }          from '../../i18n/LanguageContext'
import { Bot }              from 'lucide-react'

export default function ChatWindow({ messages, isStreaming, onSuggestion }) {
  const bottomRef = useRef(null)
  const { lang }  = useLang()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Tezkor takliflar — tilga qarab
  const SUGGESTIONS = {
    uz: ["Menga she'r yoz", "Python kodini tushuntir", "Ingliz tilini o'rgat", "Bugungi ob-havo"],
    ru: ['Напиши мне стихотворение', 'Объясни код на Python', 'Учи меня английскому', 'Погода сегодня'],
    en: ['Write me a poem', 'Explain Python code', 'Teach me Spanish', "Today's weather"],
  }

  const START_TITLE = {
    uz: 'Suhbatni boshlang',
    ru: 'Начните разговор',
    en: 'Start a conversation',
  }

  const START_SUB = {
    uz: "Biror narsa so'rang yoki muammoingizni aytib bering",
    ru: 'Задайте вопрос или опишите вашу проблему',
    en: 'Ask a question or describe your problem',
  }

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.uz

  if (messages.length === 0) {
    return (
      <div style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        justifyContent:'center',
        color:         'var(--text3)',
        gap:           '12px',
        padding:       '20px',
      }}>
        <div style={{
          width:          64,
          height:         64,
          borderRadius:   '20px',
          background:     'rgba(124,58,237,.15)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Bot size={32} style={{ color: '#a78bfa' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text2)', marginBottom: '4px' }}>
            {START_TITLE[lang] || START_TITLE.uz}
          </div>
          <div style={{ fontSize: '13px' }}>
            {START_SUB[lang] || START_SUB.uz}
          </div>
        </div>

        <div style={{
          display:        'flex',
          gap:            '8px',
          flexWrap:       'wrap',
          justifyContent: 'center',
          marginTop:      '8px',
        }}>
          {suggestions.map(s => (
            <div
              key={s}
              onClick={() => onSuggestion?.(s)}
              style={{
                padding:      '7px 14px',
                background:   'var(--surface2)',
                borderRadius: '20px',
                fontSize:     '12px',
                color:        'var(--text3)',
                border:       '1px solid var(--border)',
                cursor:       onSuggestion ? 'pointer' : 'default',
                transition:   'all .15s',
              }}
              onMouseEnter={e => {
                if (onSuggestion) {
                  e.currentTarget.style.background = 'var(--surface3)'
                  e.currentTarget.style.color = 'var(--text2)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface2)'
                e.currentTarget.style.color = 'var(--text3)'
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      {messages.map((m, i) => (
        <MessageItem
          key={i}
          message={m}
          isLast={i === messages.length - 1}
          isStreaming={isStreaming && i === messages.length - 1}
        />
      ))}
      {isStreaming && (
        <div style={{ display: 'flex', gap: '4px', padding: '12px 16px' }}>
          {[0,1,2].map(i => (
            <div
              key={i}
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   '#a78bfa',
                animation:    `bounce 1.2s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}
      <div ref={bottomRef} />
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}