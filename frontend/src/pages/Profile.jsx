// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const { user, fetchUser } = useAuthStore()
  const [form,    setForm]   = useState({ username:'', avatar:'bot' })
  const [memory,  setMemory] = useState({})
  const [oldPwd,  setOldPwd] = useState('')
  const [newPwd,  setNewPwd] = useState('')
  const [saving,  setSaving] = useState(false)

  useEffect(() => {
    if (user) setForm({ username: user.username, avatar: user.avatar })
    api.get('/api/profile/memory').then(r => setMemory(r.data||{})).catch(()=>{})
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/api/profile', form)
      await fetchUser()
      toast.success("Profil saqlandi")
    } catch { toast.error("Xato") } finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!oldPwd || !newPwd) return toast.error("Parollarni kiriting")
    try {
      await api.post('/api/auth/change-password', { old_password: oldPwd, new_password: newPwd })
      toast.success("Parol o'zgartirildi")
      setOldPwd(''); setNewPwd('')
    } catch (e) { toast.error(e.response?.data?.detail || "Xato") }
  }

  const deleteMemoryKey = async (key) => {
    await api.delete(`/api/profile/memory/${key}`)
    setMemory(m => { const n={...m}; delete n[key]; return n })
  }

  const clearMemory = async () => {
    await api.delete('/api/profile/memory')
    setMemory({})
    toast.success("Xotira tozalandi")
  }

  const AVATARS = ['bot','cat','fox','robot','alien','wizard']
  const EMOJIS  = { bot:'🤖', cat:'🐱', fox:'🦊', robot:'🦾', alien:'👽', wizard:'🧙' }

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'580px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'24px' }}>👤 Profil</h1>

      {/* Avatar + username */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
          <div style={{ width:64, height:64, borderRadius:'18px', background:'rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' }}>
            {EMOJIS[form.avatar]||'🤖'}
          </div>
          <div>
            <div style={{ fontSize:'18px', fontWeight:700 }}>{user?.username}</div>
            <div style={{ fontSize:'12px', color:'var(--text3)' }}>{user?.email} • {user?.plan}</div>
          </div>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>Foydalanuvchi nomi</label>
          <input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}
            style={{ width:'100%', padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'8px' }}>Avatar</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {AVATARS.map(a => (
              <button key={a} onClick={()=>setForm(f=>({...f,avatar:a}))}
                style={{ width:44, height:44, borderRadius:'12px', border:`2px solid ${form.avatar===a?'var(--accent)':'var(--border)'}`, cursor:'pointer', background:form.avatar===a?'rgba(124,58,237,.1)':'var(--bg)', fontSize:'22px' }}>
                {EMOJIS[a]}
              </button>
            ))}
          </div>
        </div>
        <button onClick={saveProfile} disabled={saving}
          style={{ padding:'9px 20px', borderRadius:'10px', border:'none', cursor:'pointer', background:'var(--accent)', color:'white', fontSize:'13px', fontWeight:700 }}>
          {saving ? '⏳...' : 'Saqlash'}
        </button>
      </div>

      {/* Parol */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
        <h3 style={{ fontSize:'14px', fontWeight:700, marginBottom:'14px' }}>🔐 Parol o'zgartirish</h3>
        {[['Joriy parol',oldPwd,setOldPwd],['Yangi parol',newPwd,setNewPwd]].map(([l,v,s],i)=>(
          <div key={i} style={{ marginBottom:'10px' }}>
            <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'4px' }}>{l}</label>
            <input type="password" value={v} onChange={e=>s(e.target.value)}
              style={{ width:'100%', padding:'9px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
          </div>
        ))}
        <button onClick={changePassword}
          style={{ padding:'9px 20px', borderRadius:'10px', border:'none', cursor:'pointer', background:'var(--surface2)', color:'var(--text2)', fontSize:'13px', fontWeight:700, marginTop:'4px' }}>
          O'zgartirish
        </button>
      </div>

      {/* Xotira */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h3 style={{ fontSize:'14px', fontWeight:700 }}>🧠 AI Xotira ({Object.keys(memory).length})</h3>
          {Object.keys(memory).length > 0 && (
            <button onClick={clearMemory}
              style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid rgba(248,113,113,.3)', cursor:'pointer', background:'rgba(248,113,113,.1)', color:'#f87171', fontSize:'12px' }}>
              Tozalash
            </button>
          )}
        </div>
        {Object.keys(memory).length === 0 ? (
          <p style={{ color:'var(--text3)', fontSize:'13px' }}>Hali xotira yo'q</p>
        ) : Object.entries(memory).map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <div><span style={{ fontSize:'12px', color:'#a78bfa', fontWeight:600 }}>{k}:</span> <span style={{ fontSize:'13px', color:'var(--text2)' }}>{v}</span></div>
            <button onClick={()=>deleteMemoryKey(k)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'16px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}