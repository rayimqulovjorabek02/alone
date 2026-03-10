// src/pages/NewPassword.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate                = useNavigate()
  const { state }               = useLocation()
  const email = state?.email || ''
  const code  = state?.code  || ''

  const handleSubmit = async () => {
    if (password.length < 6) return toast.error("Parol kamida 6 ta belgi")
    if (password !== confirm) return toast.error("Parollar mos emas")
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { email, code, password })
      toast.success("Parol o'zgartirildi!")
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'360px' }}>
        <h2 style={{ textAlign:'center', marginBottom:'24px', fontSize:'22px', fontWeight:800 }}>Yangi parol</h2>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
          {[['Yangi parol', password, setPassword], ['Qaytarish', confirm, setConfirm]].map(([label, val, set], i) => (
            <div key={i} style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'5px' }}>{label}</label>
              <input type="password" value={val} onChange={e=>set(e.target.value)}
                placeholder="••••••••"
                style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700, marginTop:'6px' }}>
            {loading ? '⏳...' : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}