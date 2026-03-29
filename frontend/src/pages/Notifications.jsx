// src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import { useLang } from '../i18n/LanguageContext'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'

export default function Notifications() {
  const [items, setItems] = useState([])
  const { t, lang }       = useLang()

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await api.get('/api/notifications')
      setItems(data || [])
    } catch {}
  }

  const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`)
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
  }

  const markAllRead = async () => {
    await api.put('/api/notifications/read-all')
    setItems(prev => prev.map(n => ({ ...n, is_read: 1 })))
  }

  const del = async (id) => {
    await api.delete(`/api/notifications/${id}`)
    setItems(prev => prev.filter(n => n.id !== id))
  }

  const unread = items.filter(n => !n.is_read).length

  const locale = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[lang] || 'uz-UZ'

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'600px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', animation:'fadeIn 0.3s var(--ease)' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:800, letterSpacing:'-0.4px' }}>{t('notifications')}</h1>
          {unread > 0 && (
            <span style={{ fontSize:'12px', color:'#f59e0b', marginTop:'4px', display:'block' }}>
              {unread} {t('newNotif')}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', cursor:'pointer', background:'var(--surface)', color:'var(--text2)', fontSize:'12px', fontFamily:'var(--font)', fontWeight:500, transition:'all .15s' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <CheckCheck size={14}/> {t('markAllRead')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text3)', animation:'fadeIn 0.3s var(--ease)' }}>
          <Bell size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.2 }}/>
          <div style={{ fontSize:'14px' }}>{t('noNotifications')}</div>
        </div>
      ) : items.map((n, i) => (
        <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
          style={{
            background:   !n.is_read ? 'rgba(124,58,237,.05)' : 'var(--surface)',
            border:       `1px solid ${!n.is_read ? 'rgba(124,58,237,.25)' : 'var(--border)'}`,
            borderRadius: 'var(--r-xl)',
            padding:      '14px 16px',
            marginBottom: '10px',
            cursor:       !n.is_read ? 'pointer' : 'default',
            transition:   'all .15s',
            animation:    `fadeIn 0.3s var(--ease) ${i * 40}ms both`,
          }}
          onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.borderColor = 'rgba(124,58,237,.4)' }}
          onMouseLeave={e => { if (!n.is_read) e.currentTarget.style.borderColor = 'rgba(124,58,237,.25)' }}
        >
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px', display:'flex', alignItems:'center', gap:'8px' }}>
                {!n.is_read && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', display:'inline-block', flexShrink:0 }}/>}
                {n.title}
              </div>
              <div style={{ fontSize:'13px', color:'var(--text2)' }}>{n.message}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'6px' }}>
                {new Date(n.created_at * 1000).toLocaleString(locale)}
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); del(n.id) }}
              title={t('deleteNotif')}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', marginLeft:'10px', padding:'4px', borderRadius:'6px', display:'flex', transition:'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
              <Trash2 size={14}/>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}