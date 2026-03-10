// src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'

export default function Notifications() {
  const [items, setItems] = useState([])

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await api.get('/api/notifications')
    setItems(data || [])
  }

  const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`)
    setItems(prev => prev.map(n => n.id===id ? {...n, is_read:1} : n))
  }

  const markAllRead = async () => {
    await api.put('/api/notifications/read-all')
    setItems(prev => prev.map(n => ({...n, is_read:1})))
  }

  const del = async (id) => {
    await api.delete(`/api/notifications/${id}`)
    setItems(prev => prev.filter(n => n.id !== id))
  }

  const unread = items.filter(n => !n.is_read).length

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'600px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800 }}>🔔 Bildirishnomalar</h1>
          {unread>0 && <span style={{ fontSize:'12px', color:'#f59e0b' }}>{unread} ta yangi</span>}
        </div>
        {unread>0 && <button onClick={markAllRead}
          style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'10px', border:'1px solid var(--border)', cursor:'pointer', background:'var(--surface)', color:'var(--text2)', fontSize:'12px' }}>
          <CheckCheck size={14}/> Barchasini o'qish
        </button>}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)' }}>
          <Bell size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }}/>
          <div>Bildirishnomalar yo'q</div>
        </div>
      ) : items.map(n => (
        <div key={n.id} onClick={()=>!n.is_read&&markRead(n.id)}
          style={{ background:'var(--surface)', border:`1px solid ${!n.is_read?'rgba(124,58,237,.3)':'var(--border)'}`, borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', cursor:!n.is_read?'pointer':'default',
            background:!n.is_read?'rgba(124,58,237,.05)':'var(--surface)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}>
                {!n.is_read && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }}/>}
                {n.title}
              </div>
              <div style={{ fontSize:'13px', color:'var(--text3)' }}>{n.message}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'6px' }}>{new Date(n.created_at).toLocaleString('uz-UZ')}</div>
            </div>
            <button onClick={e=>{e.stopPropagation();del(n.id)}}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', marginLeft:'10px' }}>
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}