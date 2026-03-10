// src/components/chat/CodeEditor.jsx
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Play } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CodeEditor({ code, language = 'python', onRun }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Nusxalandi")
    setTimeout(()=>setCopied(false), 2000)
  }

  return (
    <div style={{ borderRadius:'12px', overflow:'hidden', border:'1px solid var(--border)', marginBottom:'8px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 14px', background:'#1e1e2e', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <span style={{ fontSize:'12px', color:'var(--text3)', fontFamily:'monospace' }}>{language}</span>
        <div style={{ display:'flex', gap:'6px' }}>
          {onRun && (
            <button onClick={()=>onRun(code, language)}
              style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 10px', borderRadius:'6px', border:'none', cursor:'pointer', background:'rgba(34,197,94,.15)', color:'#22c55e', fontSize:'11px', fontWeight:600 }}>
              <Play size={11}/> Run
            </button>
          )}
          <button onClick={copy}
            style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 10px', borderRadius:'6px', border:'none', cursor:'pointer', background:'rgba(255,255,255,.06)', color:'var(--text3)', fontSize:'11px' }}>
            {copied ? <><Check size={11}/> OK</> : <><Copy size={11}/> Nusxa</>}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin:0, borderRadius:0, fontSize:'13px', maxHeight:'400px' }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}