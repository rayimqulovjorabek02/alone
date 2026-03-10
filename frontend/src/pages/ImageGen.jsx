// src/pages/ImageGen.jsx
import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Sparkles, Download } from 'lucide-react'

const STYLES = ['realistic','anime','art','cartoon','sketch','cinematic','3d','watercolor','oil','pixel']

export default function ImageGen() {
  const [prompt,   setPrompt]   = useState('')
  const [style,    setStyle]    = useState('realistic')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Prompt kerak")
    setLoading(true)
    try {
      const { data } = await api.post('/api/image/generate', { prompt, style })
      setResult(data)
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato yuz berdi")
    } finally { setLoading(false) }
  }

  const handleDownload = () => {
    const a    = document.createElement('a')
    a.href     = `data:image/png;base64,${result.image_b64}`
    a.download = `alone-ai-${Date.now()}.png`
    a.click()
  }

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'700px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'6px' }}>🎨 Rasm Generatsiya</h1>
      <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>Tasvirlaringizni matn orqali yarating</p>

      {/* Prompt */}
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
        placeholder="Masalan: tog'lar orasida kechqurun, rangli osmonda yulduzlar..."
        rows={3}
        style={{ width:'100%', padding:'14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', color:'var(--text)', fontSize:'14px', resize:'vertical', outline:'none', fontFamily:'inherit', marginBottom:'14px', boxSizing:'border-box' }} />

      {/* Styles */}
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'18px' }}>
        {STYLES.map(s => (
          <button key={s} onClick={()=>setStyle(s)}
            style={{ padding:'6px 14px', borderRadius:'20px', border:`1px solid ${style===s?'var(--accent)':'var(--border)'}`, cursor:'pointer', fontSize:'12px', fontWeight:style===s?700:400,
              background:style===s?'rgba(124,58,237,.15)':'var(--surface)', color:style===s?'#a78bfa':'var(--text3)' }}>
            {s}
          </button>
        ))}
      </div>

      <button onClick={handleGenerate} disabled={loading||!prompt.trim()}
        style={{ width:'100%', padding:'13px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loading||!prompt.trim()?0.6:1 }}>
        <Sparkles size={16}/>{loading ? 'Yaratilmoqda...' : 'Yaratish'}
      </button>

      {/* Result */}
      {result?.image_b64 && (
        <div style={{ marginTop:'24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', overflow:'hidden' }}>
          <img src={`data:image/png;base64,${result.image_b64}`} alt="Generated" style={{ width:'100%', display:'block' }}/>
          <div style={{ padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'11px', color:'var(--text3)' }}>{result.engine}</span>
            <button onClick={handleDownload}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'8px', border:'1px solid var(--border)', cursor:'pointer', background:'var(--surface2)', color:'var(--text2)', fontSize:'12px' }}>
              <Download size={14}/> Yuklab olish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}