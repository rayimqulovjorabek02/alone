// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import { MessageSquare, Image, FileText, CheckSquare, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [activity, setActivity] = useState([])

  useEffect(() => {
    api.get('/api/dashboard/stats').then(r => setStats(r.data)).catch(()=>{})
    api.get('/api/dashboard/activity').then(r => setActivity(r.data||[])).catch(()=>{})
  }, [])

  if (!stats) return <div style={{ padding:40, color:'var(--text3)', textAlign:'center' }}>⏳ Yuklanmoqda...</div>

  const CARDS = [
    { label:'Bugungi xabarlar', value:`${stats.messages_today}/${stats.messages_limit}`, icon:MessageSquare, color:'#a78bfa', bg:'rgba(167,139,250,.1)' },
    { label:'Bugungi rasmlar',  value:`${stats.images_today}/${stats.images_limit}`,   icon:Image,          color:'#34d399', bg:'rgba(52,211,153,.1)' },
    { label:"Jami suhbatlar",   value:stats.total_sessions,                            icon:TrendingUp,      color:'#60a5fa', bg:'rgba(96,165,250,.1)' },
    { label:"Bajarilgan vazifalar", value:`${stats.todos_done}/${stats.todos_done+stats.todos_pending}`, icon:CheckSquare, color:'#f59e0b', bg:'rgba(245,158,11,.1)' },
  ]

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'4px' }}>Dashboard</h1>
        <p style={{ color:'var(--text3)', fontSize:'13px' }}>Plan: <span style={{ color:'#a78bfa', fontWeight:600 }}>{stats.plan}</span></p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'14px', marginBottom:'28px' }}>
        {CARDS.map(c => (
          <div key={c.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px' }}>
            <div style={{ width:40, height:40, borderRadius:'12px', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
              <c.icon size={20} style={{ color:c.color }}/>
            </div>
            <div style={{ fontSize:'22px', fontWeight:800, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Son suhbatlar */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:700, marginBottom:'14px' }}>🕐 So'nggi suhbatlar</h2>
        {activity.length === 0 ? (
          <p style={{ color:'var(--text3)', fontSize:'13px' }}>Hali suhbat yo'q</p>
        ) : activity.map(s => (
          <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:'13px', color:'var(--text2)' }}>{s.title}</div>
            <div style={{ fontSize:'11px', color:'var(--text3)' }}>{s.msg_count} xabar</div>
          </div>
        ))}
      </div>
    </div>
  )
}