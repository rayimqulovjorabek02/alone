// src/components/chat/MessageItem.jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTTS } from '../../hooks/useTTS'
import { Copy, Volume2, VolumeX } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessageItem({ message, isLast, isStreaming }) {
  const isUser = message.role === 'user'
  const { speak, stop, isPlaying, isLoading } = useTTS()

  const copyText = () => {
    navigator.clipboard.writeText(message.content)
    toast.success("Nusxalandi")
  }

  const handleTTS = () => {
    if (isPlaying) stop()
    else speak(message.content)
  }

  return (
    <div style={{ display:'flex', justifyContent: isUser?'flex-end':'flex-start', marginBottom:'16px', gap:'8px' }}>
      {!isUser && (
        <div style={{ width:32, height:32, borderRadius:'10px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px', fontSize:'16px' }}>
          🤖
        </div>
      )}
      <div style={{ maxWidth:'75%', minWidth:'40px' }}>
        <div style={{
          padding: isUser ? '10px 14px' : '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          background: isUser ? 'var(--accent)' : 'var(--surface2)',
          color: 'var(--text)',
          fontSize: '14px',
          lineHeight: 1.7,
          border: '1px solid ' + (isUser ? 'transparent' : 'var(--border)'),
        }}>
          {isUser ? (
            <p style={{ margin:0, whiteSpace:'pre-wrap' }}>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const lang = /language-(\w+)/.exec(className || '')?.[1]
                  return !inline && lang ? (
                    <SyntaxHighlighter style={oneDark} language={lang} PreTag="div" {...props}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code style={{ background:'rgba(255,255,255,.1)', padding:'2px 6px', borderRadius:'4px', fontSize:'13px' }} {...props}>{children}</code>
                  )
                },
                p: ({children}) => <p style={{ margin:'0 0 8px', whiteSpace:'pre-wrap' }}>{children}</p>,
                ul: ({children}) => <ul style={{ paddingLeft:'20px', margin:'4px 0' }}>{children}</ul>,
                ol: ({children}) => <ol style={{ paddingLeft:'20px', margin:'4px 0' }}>{children}</ol>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action buttons */}
        {!isUser && !isStreaming && (
          <div style={{ display:'flex', gap:'4px', marginTop:'6px' }}>
            <button onClick={copyText} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'3px', borderRadius:'6px' }} title="Nusxalash">
              <Copy size={13}/>
            </button>
            <button onClick={handleTTS} style={{ background:'none', border:'none', cursor:'pointer', color: isPlaying?'#a78bfa':'var(--text3)', padding:'3px', borderRadius:'6px' }} title="O'qish">
              {isPlaying ? <VolumeX size={13}/> : <Volume2 size={13}/>}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div style={{ width:32, height:32, borderRadius:'10px', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px', fontSize:'16px' }}>
          👤
        </div>
      )}
    </div>
  )
}