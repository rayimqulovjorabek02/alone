// src/components/reminder/ReminderList.jsx
import { useState, useEffect } from 'react'
import api from '../../api/client'
import ReminderItem from './ReminderItem'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function ReminderList() {
  const [reminders, setReminders] = useState([])
  const [title,     setTitle]     = useState('')
  const [remindAt,  setRemindAt]  = useState('')
  const [adding,    setAdding]    = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await api.get('/api/reminder')
    setReminders(data || [])
  }

  const add = async () => {
    if (!title.trim() || !remindAt) return toast.error("Sarlavha va vaqt kerak")
    setAdding(true)
    try {
      await api.post('/api/reminder', { title, remind_at: remindAt })
      setTitle(''); setRemindAt('')
      await load()
      toast.success("Qo'shildi!")
    } finally { setAdding(false) }
  }

  const del = async (id) => {
    await api.delete(`/api/reminder/${id}`)
    setReminders(r => r.filter(x => x.id !== id))
  }

  return (
    <div>
      {/* Add form */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
        <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Eslatma sarlavhasi"
            style={{ flex:1, padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13px', outline:'none' }}/>
          <input type="datetime-local" value={remindAt} onChange={e=>setRemindAt(e.target.value)}
            style={{ padding:'9px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13px', outline:'none', colorScheme:'dark' }}/>
        </div>
        <button onClick={add} disabled={adding}
          style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', border:'none', cursor:'pointer', background:'var(--accent)', color:'white', fontSize:'13px', fontWeight:600 }}>
          <Plus size={14}/> {adding?'Qo\'shilmoqda...':'Qo\'shish'}
        </button>
      </div>

      {reminders.length === 0 ? (
        <p style={{ color:'var(--text3)', fontSize:'13px', textAlign:'center', padding:'20px' }}>Eslatmalar yo'q</p>
      ) : reminders.map(r => <ReminderItem key={r.id} reminder={r} onDelete={del}/>)}
    </div>
  )
}