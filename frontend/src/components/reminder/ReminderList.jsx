// src/components/reminder/ReminderList.jsx
import { useState, useEffect } from 'react'
import api                     from '../../api/client'
import ReminderItem            from './ReminderItem'
import toast                   from 'react-hot-toast'
import { useLang }             from '../../i18n/LanguageContext'
import { Plus, Calendar, Clock } from 'lucide-react'

export default function ReminderList() {
  const [reminders, setReminders] = useState([])
  const [title,     setTitle]     = useState('')
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [adding,    setAdding]    = useState(false)
  const [focused,   setFocused]   = useState(false)
  const { t, lang }               = useLang()

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await api.get('/api/reminder')
      setReminders(data || [])
    } catch {}
  }

  const add = async () => {
    if (!title.trim() || !date || !time) return toast.error(
      lang === 'ru' ? 'Нужны заголовок, дата и время' :
      lang === 'en' ? 'Title, date and time required' :
                      'Sarlavha, sana va vaqt kerak'
    )
    const remindAt = `${date}T${time}`
    setAdding(true)
    try {
      await api.post('/api/reminder', { title, remind_at: remindAt })
      setTitle('')
      setDate('')
      setTime('')
      await load()
      toast.success(t('success'))
    } catch {
      toast.error(t('error'))
    } finally {
      setAdding(false)
    }
  }

  const del = async (id) => {
    await api.delete(`/api/reminder/${id}`)
    setReminders(r => r.filter(x => x.id !== id))
  }

  const base = (isFoc) => ({
    padding:      '9px 12px',
    background:   'var(--bg)',
    border:       `1px solid ${isFoc ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--r-lg)',
    color:        'var(--text)',
    fontSize:     '13px',
    outline:      'none',
    fontFamily:   'var(--font)',
    transition:   'border-color .2s',
    colorScheme:  'dark',
  })

  return (
    <div>
      {/* Qo'shish formasi */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '16px', marginBottom: '16px' }}>

        {/* Sarlavha */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={lang === 'ru' ? 'Заголовок напоминания' : lang === 'en' ? 'Reminder title' : 'Eslatma sarlavhasi'}
          style={{ ...base(focused), width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
        />

        {/* Sana + Vaqt */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '150px' }}>
            <Calendar size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ ...base(false), flex: 1, cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ ...base(false), cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Tanlangan vaqt preview */}
        {date && time && (
          <div style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={11} />
            {new Date(`${date}T${time}`).toLocaleString(
              lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ',
              { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
            )}
          </div>
        )}

        <button
          onClick={add}
          disabled={adding}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: 'var(--r-lg)', border: 'none', cursor: adding ? 'wait' : 'pointer', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)', opacity: adding ? 0.7 : 1 }}
        >
          <Plus size={14} />
          {adding
            ? (lang === 'ru' ? 'Добавляется...' : lang === 'en' ? 'Adding...' : "Qo'shilmoqda...")
            : (lang === 'ru' ? 'Добавить'       : lang === 'en' ? 'Add'       : "Qo'shish")
          }
        </button>
      </div>

      {/* Ro'yxat */}
      {reminders.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          {t('noReminders')}
        </p>
      ) : (
        reminders.map(r => <ReminderItem key={r.id} reminder={r} onDelete={del} />)
      )}
    </div>
  )
}