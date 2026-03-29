// src/pages/Reminder.jsx
import ReminderList from '../components/reminder/ReminderList'
import { useLang } from '../i18n/LanguageContext'
import { Bell } from 'lucide-react'

export default function Reminder() {
  const { t } = useLang()
  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'620px', margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
        <div style={{ width:38, height:38, borderRadius:'12px', background:'rgba(245,158,11,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Bell size={20} style={{ color:'#f59e0b' }} />
        </div>
        <h1 style={{ fontSize:'22px', fontWeight:800 }}>{t('reminders')}</h1>
      </div>
      <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>{t('manageReminders')}</p>
      <ReminderList />
    </div>
  )
}