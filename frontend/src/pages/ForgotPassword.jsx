// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email) return toast.error("Email kerak")
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      toast.success("Kod emailga yuborildi")
      navigate('/reset-code', { state: { email } })
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>
        <h2 style={{ textAlign:'center', marginBottom:'24px', fontSize:'22px', fontWeight:800 }}>Parolni tiklash</h2>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
          <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'20px' }}>Emailingizga tasdiqlash kodi yuboramiz</p>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="email@misol.com" onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box', marginBottom:'16px' }} />
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700 }}>
            {loading ? '⏳...' : 'Kod yuborish'}
          </button>
          <div style={{ textAlign:'center', marginTop:'14px' }}>
            <Link to="/login" style={{ color:'var(--text3)', fontSize:'13px' }}>← Orqaga</Link>
          </div>
        </div>
      </div>
    </div>
  )
}