// src/pages/FileAnalysis.jsx
import { useState, useRef } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Upload, FileText, X } from 'lucide-react'

export default function FileAnalysis() {
  const [file,      setFile]      = useState(null)
  const [question,  setQuestion]  = useState('Bu faylni tahlil qil va asosiy ma\'lumotlarni ber')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) return toast.error("Fayl tanlang")
    const form = new FormData()
    form.append('file', file)
    form.append('question', question)
    setLoading(true)
    try {
      const { data } = await api.post('/api/files/analyze', form)
      setResult(data)
    } catch (e) {
      toast.error(e.response?.data?.detail || "Fayl tahlil xato")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'700px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'6px' }}>📄 Fayl Tahlil</h1>
      <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>PDF, DOCX, TXT fayllarini AI bilan tahlil qiling</p>

      {/* Upload zone */}
      <div onClick={()=>inputRef.current?.click()}
        style={{ border:`2px dashed ${file?'var(--accent)':'var(--border)'}`, borderRadius:'16px', padding:'40px', textAlign:'center', cursor:'pointer', marginBottom:'16px', background:file?'rgba(124,58,237,.05)':'transparent', transition:'all .2s' }}>
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.csv" onChange={handleFile} style={{ display:'none' }}/>
        {file ? (
          <div>
            <FileText size={40} style={{ color:'var(--accent)', margin:'0 auto 10px' }}/>
            <div style={{ fontWeight:600, marginBottom:'4px' }}>{file.name}</div>
            <div style={{ fontSize:'12px', color:'var(--text3)' }}>{(file.size/1024).toFixed(1)} KB</div>
            <button onClick={e=>{e.stopPropagation();setFile(null);setResult(null)}}
              style={{ marginTop:'10px', background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
              <X size={16}/>
            </button>
          </div>
        ) : (
          <>
            <Upload size={36} style={{ color:'var(--text3)', margin:'0 auto 12px' }}/>
            <div style={{ fontWeight:600, marginBottom:'4px' }}>Fayl yuklash</div>
            <div style={{ fontSize:'12px', color:'var(--text3)' }}>PDF, DOCX, TXT, CSV • Max 10MB</div>
          </>
        )}
      </div>

      <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={2}
        placeholder="Savol yozing..."
        style={{ width:'100%', padding:'12px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', color:'var(--text)', fontSize:'14px', resize:'none', outline:'none', fontFamily:'inherit', marginBottom:'14px', boxSizing:'border-box' }}/>

      <button onClick={handleAnalyze} disabled={!file||loading}
        style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700, opacity:!file||loading?0.6:1 }}>
        {loading ? '⏳ Tahlil qilinmoqda...' : '🔍 Tahlil qilish'}
      </button>

      {result && (
        <div style={{ marginTop:'20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px' }}>
          <div style={{ fontSize:'12px', color:'var(--text3)', marginBottom:'12px' }}>
            {result.filename} • {result.text_len} belgi
          </div>
          <div style={{ fontSize:'14px', lineHeight:1.7, color:'var(--text2)', whiteSpace:'pre-wrap' }}>{result.analysis}</div>
        </div>
      )}
    </div>
  )
}