// src/components/reminder/ReminderItem.jsx
import { Trash2, Bell } from 'lucide-react'

export default function ReminderItem({ reminder, onDelete }) {
  const isPast = new Date(reminder.remind_at) < new Date()

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '12px',
      padding:      '12px 14px',
      background:   'var(--surface)',
      border:       `1px solid ${isPast?'rgba(248,113,113,.2)':'var(--border)'}`,
      borderRadius: '12px',
      marginBottom: '8px',
    }}>
      <div style={{ width:36, height:36, borderRadius:'10px', background: isPast?'rgba(248,113,113,.1)':'rgba(124,58,237,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Bell size={16} style={{ color: isPast?'#f87171':'#a78bfa' }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:600, color:isPast?'var(--text3)':'var(--text)' }}>{reminder.title}</div>
        {reminder.message && <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'2px' }}>{reminder.message}</div>}
        <div style={{ fontSize:'11px', color:isPast?'#f87171':'var(--text3)', marginTop:'4px' }}>
          {new Date(reminder.remind_at).toLocaleString('uz-UZ')}
          {isPast && ' • O\'tgan'}
        </div>
      </div>
      <button onClick={()=>onDelete(reminder.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'4px', flexShrink:0 }}>
        <Trash2 size={15}/>
      </button>
    </div>
  )
}