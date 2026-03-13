// src/pages/Feedback.jsx
import { useState, useEffect } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { MessageCircle, Send } from 'lucide-react'

const TYPES = [
  { value: 'taklif',   label: '💡 Taklif',   color: '#22c55e' },
  { value: 'shikoyat', label: '⚠️ Shikoyat', color: '#f87171' },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'24px', padding:'2px',
            color: n <= (hover || value) ? '#f59e0b' : 'var(--surface2)', transition:'color .1s' }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [tab,     setTab]     = useState('new')
  const [type,    setType]    = useState('taklif')
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
    if (!message.trim()) return toast.error("Xabar yozing")
    setLoading(true)
    try {
      await api.post('/api/feedback', { type, message, rating })
      toast.success("Yuborildi! Rahmat 👍")
      setMessage(''); setRating(5)
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'640px', margin:'0 auto' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'4px' }}>💬 Taklif & Shikoyat</h1>
        <p style={{ color:'var(--text3)', fontSize:'13px' }}>Fikr-mulohazalaringiz biz uchun muhim</p>
      </div>

      <div style={{ display:'flex', gap:'4px', background:'var(--surface)', padding:'4px', borderRadius:'12px', marginBottom:'20px', width:'fit-content' }}>
        {[['new','✏️ Yangi'],['my','📋 Mening xabarlarim']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding:'8px 18px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:tab===key?700:400,
              background:tab===key?'var(--accent)':'transparent', color:tab===key?'white':'var(--text3)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'new' && (
        <div>
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'12px', color:'var(--text3)', fontWeight:600, display:'block', marginBottom:'8px' }}>TUR</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  style={{ padding:'7px 20px', borderRadius:'20px', border:`1px solid ${type===t.value?t.color:'var(--border)'}`,
                    cursor:'pointer', fontSize:'13px', fontWeight:type===t.value?700:400,
                    background:type===t.value?`${t.color}15`:'var(--surface)', color:type===t.value?t.color:'var(--text3)' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'12px', color:'var(--text3)', fontWeight:600, display:'block', marginBottom:'8px' }}>REYTING</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div style={{ marginBottom:'18px' }}>
            <label style={{ fontSize:'12px', color:'var(--text3)', fontWeight:600, display:'block', marginBottom:'6px' }}>XABAR</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Batafsil yozing..." rows={5}
              style={{ width:'100%', padding:'12px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', color:'var(--text)', fontSize:'14px', resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>

          <button onClick={handleSubmit} disabled={loading || !message.trim()}
            style={{ display:'flex', alignItems:'center', gap:'8px', padding:'12px 28px', borderRadius:'12px', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700,
              opacity:loading||!message.trim()?0.6:1 }}>
            <Send size={15}/>{loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      )}

      {tab === 'my' && (
        <div>
          {myList.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 0', color:'var(--text3)' }}>
              <MessageCircle size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.3 }}/>
              <div>Hali xabar yuborilmagan</div>
            </div>
          ) : myList.map(item => (
            <div key={item.id} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', fontWeight:600 }}>{item.type === 'taklif' ? '💡 Taklif' : '⚠️ Shikoyat'}</span>
                <span style={{ fontSize:'11px', color:'var(--text3)' }}>{new Date(item.created_at).toLocaleDateString('uz-UZ')}</span>
              </div>
              <div style={{ color:'#f59e0b', fontSize:'13px', marginBottom:'8px' }}>
                {'★'.repeat(item.rating || 0)}{'☆'.repeat(5 - (item.rating || 0))}
              </div>
              <p style={{ fontSize:'13px', color:'var(--text3)', lineHeight:1.6, margin:0 }}>{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}