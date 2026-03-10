// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Shield, Lock, Unlock, Trash2 } from 'lucide-react'

const PLANS = ['free','pro','premium']

export default function AdminPanel() {
  const [users,   setUsers]   = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await api.get('/api/admin/users')
      setUsers(data||[])
    } finally { setLoading(false) }
  }

  const setPlan = async (id, plan) => {
    await api.put(`/api/admin/users/${id}/plan?plan=${plan}`)
    setUsers(u => u.map(x => x.id===id ? {...x, plan} : x))
    toast.success("Plan o'zgartirildi")
  }

  const toggleBlock = async (id) => {
    const { data } = await api.put(`/api/admin/users/${id}/block`)
    setUsers(u => u.map(x => x.id===id ? {...x, is_active: data.is_active?1:0} : x))
  }

  const deleteUser = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await api.delete(`/api/admin/users/${id}`)
    setUsers(u => u.filter(x => x.id!==id))
    toast.success("O'chirildi")
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding:'24px', overflowY:'auto', height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
        <Shield size={22} style={{ color:'#f59e0b' }}/>
        <h1 style={{ fontSize:'20px', fontWeight:800 }}>Admin Panel</h1>
        <span style={{ fontSize:'12px', color:'var(--text3)', background:'var(--surface2)', padding:'3px 10px', borderRadius:'20px' }}>{users.length} foydalanuvchi</span>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Qidirish..."
        style={{ width:'100%', maxWidth:'360px', padding:'9px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13px', outline:'none', marginBottom:'16px', boxSizing:'border-box' }}/>

      {loading ? <div style={{ color:'var(--text3)' }}>⏳...</div> : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 4px', fontSize:'13px' }}>
            <thead>
              <tr style={{ color:'var(--text3)' }}>
                {['ID','Foydalanuvchi','Email','Plan','Holat','Amallar'].map(h=>(
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id} style={{ background:'var(--surface)', borderRadius:'10px' }}>
                  <td style={{ padding:'10px 12px', borderRadius:'10px 0 0 10px', color:'var(--text3)' }}>{u.id}</td>
                  <td style={{ padding:'10px 12px', fontWeight:600 }}>{u.username}{u.is_admin?<span style={{color:'#f59e0b', marginLeft:6, fontSize:11}}>ADMIN</span>:null}</td>
                  <td style={{ padding:'10px 12px', color:'var(--text3)' }}>{u.email}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <select value={u.plan} onChange={e=>setPlan(u.id,e.target.value)}
                      style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', color:'var(--text2)', padding:'3px 8px', fontSize:'12px', cursor:'pointer' }}>
                      {PLANS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'20px',
                      background:u.is_active?'rgba(34,197,94,.1)':'rgba(248,113,113,.1)',
                      color:u.is_active?'#22c55e':'#f87171' }}>
                      {u.is_active?'Faol':'Bloklangan'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px', borderRadius:'0 10px 10px 0' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={()=>toggleBlock(u.id)} title={u.is_active?'Bloklash':'Faollashtirish'}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
                        {u.is_active ? <Lock size={15}/> : <Unlock size={15}/>}
                      </button>
                      <button onClick={()=>deleteUser(u.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#f87171' }}>
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}