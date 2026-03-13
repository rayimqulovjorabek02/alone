// src/pages/ResetCode.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ResetCode() {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const { state }             = useLocation()
  const email = state?.email || ''

  const handleSubmit = async () => {
    if (!code) return toast.error("Kodni kiriting")
    setLoading(true)
    try {
      await api.post('/api/auth/verify-reset-code', { email, code })
      toast.success("Kod tasdiqlandi")
      navigate('/new-password', { state: { email, code } })
    } catch (e) {
      toast.error(e.response?.data?.detail || "Noto'g'ri kod")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'360px' }}>
        <h2 style={{ textAlign:'center', marginBottom:'24px', fontSize:'22px', fontWeight:800 }}>Kodni kiriting</h2>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
          <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'20px' }}>📧 {email} ga yuborilgan 6 xonali kod</p>
          <input type="text" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
            placeholder="000000" maxLength={6} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            style={{ width:'100%', padding:'14px', textAlign:'center', letterSpacing:'8px', fontSize:'22px', fontWeight:700,
              background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'12px', color:'var(--text)',
              outline:'none', boxSizing:'border-box', marginBottom:'16px' }}/>
          <button onClick={handleSubmit} disabled={loading||code.length<6}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700,
              opacity:loading||code.length<6?0.6:1 }}>
            {loading ? '⏳...' : 'Tasdiqlash'}
          </button>
        </div>
      </div>
    </div>
  )
}