// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Bot, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const { login }               = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password) return toast.error("Email va parol kerak")
    setLoading(true)
    try {
      await login(email, password)
      toast.success("Xush kelibsiz!")
      navigate('/chat')
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:56, height:56, borderRadius:'16px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <Bot size={28} color="white" />
          </div>
          <h1 style={{ fontSize:'24px', fontWeight:800 }}>Alone AI</h1>
          <p style={{ color:'var(--text3)', fontSize:'14px', marginTop:'4px' }}>Akkauntingizga kiring</p>
        </div>

        {/* Form */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
              placeholder="email@misol.com"
              style={{ width:'100%', padding:'11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>Parol</label>
            <div style={{ position:'relative' }}>
              <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder="••••••••"
                style={{ width:'100%', padding:'11px 40px 11px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
              <button onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700, opacity:loading?0.7:1 }}>
            {loading ? '⏳ Kirmoqda...' : 'Kirish'}
          </button>
          <div style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'var(--text3)' }}>
            <Link to="/forgot-password" style={{ color:'#a78bfa' }}>Parolni unutdingizmi?</Link>
          </div>
        </div>
        <p style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--text3)' }}>
          Akkauntingiz yo'qmi? <Link to="/register" style={{ color:'#a78bfa', fontWeight:600 }}>Ro'yxatdan o'ting</Link>
        </p>
      </div>
    </div>
  )
}