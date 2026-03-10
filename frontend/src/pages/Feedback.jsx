// src/pages/Feedback.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { ThumbsUp, MessageCircle, Star, Send } from 'lucide-react'

const TYPES = [
  { value: 'suggestion', label: '💡 Taklif',  color: '#22c55e' },
  { value: 'complaint',  label: '⚠️ Shikoyat', color: '#f87171' },
  { value: 'question',   label: '❓ Savol',     color: '#60a5fa' },
  { value: 'praise',     label: '🌟 Maqtov',   color: '#f59e0b' },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', padding: '2px', color: n <= (hover || value) ? '#f59e0b' : 'var(--surface2)', transition: 'color .1s' }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [tab,     setTab]     = useState('new')     // new | my
  const [type,    setType]    = useState('suggestion')
  const [title,   setTitle]   = useState('')
  const [message, setMessage] = useState('')
  const [rating,  setRating]  = useState(5)
  const [loading, setLoading] = useState(false)
  const [myList,  setMyList]  = useState([])

  useEffect(() => {
    if (tab === 'my') loadMyFeedback()
  }, [tab])

  const loadMyFeedback = async () => {
    const { data } = await api.get('/api/feedback/my')
    setMyList(data || [])
  }

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim())
      return toast.error("Sarlavha va xabar to'ldiring")
    setLoading(true)
    try {
      await api.post('/api/feedback', { type, title, message, rating })
      toast.success("Yuborildi! Tez orada ko'rib chiqamiz 👍")
      setTitle(''); setMessage(''); setRating(5)
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato")
    } finally { setLoading(false) }
  }

  const STATUS_LABELS = {
    pending:    { label: '⏳ Kutilmoqda', color: '#f59e0b' },
    reviewed:   { label: '👁️ Ko\'rildi',   color: '#60a5fa' },
    resolved:   { label: '✅ Hal qilindi', color: '#22c55e' },
    rejected:   { label: '❌ Rad etildi', color: '#f87171' },
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%', maxWidth: '640px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>💬 Taklif & Shikoyat</h1>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Fikr-mulohazalaringiz biz uchun muhim</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '4px', borderRadius: '12px', marginBottom: '20px', width: 'fit-content' }}>
        {[['new', '✏️ Yangi'], ['my', '📋 Mening xabarlarim']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === key ? 700 : 400,
              background: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? 'white' : 'var(--text3)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* === YANGI XABAR === */}
      {tab === 'new' && (
        <div>
          {/* Tur */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>TUR</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${type === t.value ? t.color : 'var(--border)'}`,
                    cursor: 'pointer', fontSize: '13px', fontWeight: type === t.value ? 700 : 400,
                    background: type === t.value ? `${t.color}15` : 'var(--surface)',
                    color: type === t.value ? t.color : 'var(--text3)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reyting */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>REYTING</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Sarlavha */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SARLAVHA</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Qisqacha sarlavha..."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Xabar */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>XABAR</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Batafsil yozing..."
              rows={5}
              style={{ width: '100%', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading || !title.trim() || !message.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', fontSize: '14px', fontWeight: 700, opacity: loading || !title.trim() || !message.trim() ? 0.6 : 1 }}>
            <Send size={15} />
            {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      )}

      {/* === MENING XABARLARIM === */}
      {tab === 'my' && (
        <div>
          {myList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text3)' }}>
              <MessageCircle size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .3 }} />
              <div>Hali xabar yuborilmagan</div>
            </div>
          ) : myList.map(item => {
            const st = STATUS_LABELS[item.status] || STATUS_LABELS.pending
            return (
              <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
                {/* Sarlavha + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {TYPES.find(t => t.value === item.type)?.label} • {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: st.color, background: `${st.color}15`, padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                    {st.label}
                  </span>
                </div>

                {/* Reyting */}
                <div style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '8px' }}>
                  {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                </div>

                {/* Xabar */}
                <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6, margin: 0 }}>{item.message}</p>

                {/* Admin javobi */}
                {item.admin_reply && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.2)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '4px' }}>🛡️ Admin javobi</div>
                    <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>{item.admin_reply}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}