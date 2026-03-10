// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Bot } from 'lucide-react'

const AVATARS = ['bot','cat','fox','robot','alien','wizard']

export default function Register() {
  const [form,    setForm]    = useState({ username:'', email:'', password:'', avatar:'bot' })
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password)
      return toast.error("Barcha maydonlar to'ldirilishi kerak")
    if (form.password.length < 6)
      return toast.error("Parol kamida 6 ta belgi")
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success("Ro'yxatdan o'tildi!")
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:52, height:52, borderRadius:'14px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
            <Bot size={24} color="white" />
          </div>
          <h1 style={{ fontSize:'22px', fontWeight:800 }}>Ro'yxatdan o'ting</h1>
        </div>

        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px' }}>
          {[['username','Foydalanuvchi nomi','text','misol_user'],['email','Email','email','email@misol.com'],['password','Parol','password','••••••••']].map(([key,label,type,ph]) => (
            <div key={key} style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'5px' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e=>update(key,e.target.value)}
                placeholder={ph} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                style={{ width:'100%', padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'8px' }}>Avatar</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {AVATARS.map(a => (
                <button key={a} onClick={()=>update('avatar',a)}
                  style={{ padding:'6px 14px', borderRadius:'8px', border:`2px solid ${form.avatar===a?'var(--accent)':'var(--border)'}`, cursor:'pointer', background:form.avatar===a?'rgba(124,58,237,.1)':'var(--bg)', color:form.avatar===a?'#a78bfa':'var(--text3)', fontSize:'12px', fontWeight:600 }}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700, opacity:loading?0.7:1 }}>
            {loading ? '⏳...' : "Ro'yxatdan o'tish"}
          </button>
        </div>
        <p style={{ textAlign:'center', marginTop:'18px', fontSize:'13px', color:'var(--text3)' }}>
          Akkauntingiz bormi? <Link to="/login" style={{ color:'#a78bfa', fontWeight:600 }}>Kirish</Link>
        </p>
      </div>
    </div>
  )
}