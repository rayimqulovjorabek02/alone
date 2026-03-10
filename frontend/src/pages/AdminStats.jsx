// src/pages/AdminStats.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import { Users, MessageSquare, Image, TrendingUp } from 'lucide-react'

export default function AdminStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/admin-stats').then(r=>setStats(r.data)).catch(()=>{})
  }, [])

  if (!stats) return <div style={{ padding:40, color:'var(--text3)' }}>⏳...</div>

  const CARDS = [
    { label:"Jami foydalanuvchilar", value:stats.total_users,    icon:Users,         color:'#a78bfa' },
    { label:"Bugun faol",            value:stats.today_active,   icon:TrendingUp,    color:'#34d399' },
    { label:"Jami xabarlar",         value:stats.total_messages, icon:MessageSquare, color:'#60a5fa' },
    { label:"Jami rasmlar",          value:stats.total_images,   icon:Image,         color:'#f59e0b' },
  ]

  return (
    <div style={{ padding:'24px', overflowY:'auto', height:'100%' }}>
      <h1 style={{ fontSize:'20px', fontWeight:800, marginBottom:'20px' }}>📊 Admin Statistika</h1>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px', marginBottom:'24px' }}>
        {CARDS.map(c=>(
          <div key={c.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px' }}>
            <c.icon size={20} style={{ color:c.color, marginBottom:'10px' }}/>
            <div style={{ fontSize:'24px', fontWeight:800, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:700, marginBottom:'12px', color:'var(--text3)' }}>Planlar bo'yicha</h3>
          {Object.entries(stats.plans||{}).map(([plan,count])=>(
            <div key={plan} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'13px' }}>
              <span style={{ color:'var(--text2)' }}>{plan}</span>
              <span style={{ fontWeight:700, color:'#a78bfa' }}>{count}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:700, marginBottom:'12px', color:'var(--text3)' }}>Xulosa</h3>
          {[
            ['Faol foydalanuvchilar', stats.active_users],
            ['Bu hafta yangi', stats.new_users_week],
            ['Yangi shikoyatlar', stats.feedback_new],
            ["Jami sessiyalar", stats.total_sessions],
          ].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'13px' }}>
              <span style={{ color:'var(--text2)' }}>{l}</span>
              <span style={{ fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}