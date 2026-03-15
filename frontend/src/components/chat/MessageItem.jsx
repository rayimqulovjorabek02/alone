// src/components/chat/MessageItem.jsx
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTTS } from '../../hooks/useTTS'
import { Copy, Volume2, VolumeX, Check, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

// Kod bloki — nusxa olish tugmasi bilan
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position:     'relative',
      borderRadius: 'var(--r-lg)',
      overflow:     'hidden',
      margin:       '8px 0',
      border:       '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '6px 12px',
        background:     'rgba(255,255,255,0.04)',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{
          fontSize:   '11px',
          color:      'var(--text3)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '4px',
            background:     'none',
            border:         'none',
            color:          copied ? 'var(--success)' : 'var(--text3)',
            fontSize:       '11px',
            cursor:         'pointer',
            padding:        '2px 6px',
            borderRadius:   '4px',
            transition:     'all .15s',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Nusxalandi' : 'Nusxa'}
        </button>
      </div>

      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin:     0,
          padding:    '14px',
          background: '#1a1a24',
          fontSize:   '13px',
          lineHeight: 1.6,
          borderRadius: 0,
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

export default function MessageItem({ message, isStreaming }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const { speak, stop, isPlaying } = useTTS()

  const copyText = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Nusxalandi')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTTS = () => {
    if (isPlaying) stop()
    else speak(message.content)
  }

  return (
    <div style={{
      display:       'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom:  '20px',
      gap:           '10px',
      animation:     'fadeIn 0.2s var(--ease)',
    }}>

      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   'var(--r-md)',
          background:     'linear-gradient(135deg, #7c3aed, #5b21b6)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          marginTop:      '2px',
          boxShadow:      '0 2px 8px rgba(124,58,237,0.3)',
        }}>
          <Sparkles size={15} color="white" />
        </div>
      )}

      <div style={{ maxWidth: '78%', minWidth: '40px' }}>
        {/* Xabar pufakchasi */}
        <div style={{
          padding:      isUser ? '10px 15px' : '13px 16px',
          borderRadius: isUser ? 'var(--r-xl) var(--r-xl) var(--r-sm) var(--r-xl)' : 'var(--r-sm) var(--r-xl) var(--r-xl) var(--r-xl)',
          background:   isUser ? 'var(--accent)' : 'var(--surface2)',
          color:        'var(--text)',
          fontSize:     '14px',
          lineHeight:   1.7,
          border:       `1px solid ${isUser ? 'transparent' : 'var(--border)'}`,
          boxShadow:    isUser ? '0 2px 12px var(--accent-glow)' : 'none',
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
          ) : (
            <div className="prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const lang = /language-(\w+)/.exec(className || '')?.[1]
                    const content = String(children).replace(/\n$/, '')
                    if (!inline && lang) {
                      return <CodeBlock language={lang}>{content}</CodeBlock>
                    }
                    return (
                      <code style={{
                        background:   'rgba(124,58,237,0.15)',
                        color:        '#c4b5fd',
                        padding:      '2px 6px',
                        borderRadius: '4px',
                        fontSize:     '13px',
                        fontFamily:   'var(--font-mono)',
                      }} {...props}>
                        {children}
                      </code>
                    )
                  },
                  p:          ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
                  ul:         ({ children }) => <ul style={{ paddingLeft: '20px', margin: '4px 0 8px' }}>{children}</ul>,
                  ol:         ({ children }) => <ol style={{ paddingLeft: '20px', margin: '4px 0 8px' }}>{children}</ol>,
                  li:         ({ children }) => <li style={{ margin: '3px 0' }}>{children}</li>,
                  h1:         ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '12px 0 6px', letterSpacing: '-0.3px' }}>{children}</h1>,
                  h2:         ({ children }) => <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '10px 0 5px', letterSpacing: '-0.2px' }}>{children}</h2>,
                  h3:         ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>,
                  strong:     ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote style={{
                      borderLeft:  '3px solid var(--accent)',
                      paddingLeft: '12px',
                      margin:      '8px 0',
                      color:       'var(--text2)',
                      fontStyle:   'italic',
                    }}>
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ background: 'var(--surface3)', padding: '7px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{children}</th>
                  ),
                  td: ({ children }) => (
                    <td style={{ padding: '6px 12px', borderTop: '1px solid var(--border)' }}>{children}</td>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline', textUnderlineOffset: '2px' }}>{children}</a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming animatsiya */}
              {isStreaming && (
                <span style={{
                  display:      'inline-block',
                  width:        '2px',
                  height:       '14px',
                  background:   'var(--accent)',
                  marginLeft:   '2px',
                  borderRadius: '1px',
                  animation:    'pulse 0.8s ease-in-out infinite',
                  verticalAlign: 'middle',
                }} />
              )}
            </div>
          )}
        </div>

        {/* Amallar tugmalari */}
        {!isUser && !isStreaming && (
          <div style={{
            display:    'flex',
            gap:        '2px',
            marginTop:  '6px',
            paddingLeft: '4px',
          }}>
            <button
              onClick={copyText}
              title="Nusxalash"
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '4px',
                background:     'none',
                border:         'none',
                color:          copied ? 'var(--success)' : 'var(--text3)',
                padding:        '4px 8px',
                borderRadius:   'var(--r-sm)',
                fontSize:       '11px',
                transition:     'all .15s',
                cursor:         'pointer',
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Nusxalandi' : 'Nusxa'}
            </button>

            <button
              onClick={handleTTS}
              title={isPlaying ? 'To\'xtatish' : 'O\'qib berish'}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '4px',
                background:     isPlaying ? 'var(--accent-soft)' : 'none',
                border:         'none',
                color:          isPlaying ? '#a78bfa' : 'var(--text3)',
                padding:        '4px 8px',
                borderRadius:   'var(--r-sm)',
                fontSize:       '11px',
                transition:     'all .15s',
                cursor:         'pointer',
              }}
              onMouseEnter={e => { if (!isPlaying) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { if (!isPlaying) e.currentTarget.style.background = 'none' }}
            >
              {isPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
              {isPlaying ? 'To\'xtatish' : 'Eshitish'}
            </button>
          </div>
        )}
      </div>

      {/* Foydalanuvchi avatar */}
      {isUser && (
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   'var(--r-md)',
          background:     'var(--surface3)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          marginTop:      '2px',
          fontSize:       '16px',
        }}>
          👤
        </div>
      )}
    </div>
  )
}