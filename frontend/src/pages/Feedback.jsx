// src/pages/Feedback.jsx
import { useState, useEffect } from 'react'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useLang }             from '../i18n/LanguageContext'
import { MessageCircle, Send, ThumbsUp } from 'lucide-react'


// ── Yulduzcha reytingi komponenti ─────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            fontSize:    '26px',
            padding:     '2px',
            color:       n <= (hover || value) ? '#f59e0b' : 'var(--surface3)',
            transition:  'color .1s, transform .1s',
            transform:   hover === n ? 'scale(1.2)' : 'scale(1)',
          }}
        >
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
  const [focused, setFocused] = useState(false)
  const { t, lang }           = useLang()

  useEffect(() => {
    if (tab === 'my') loadMyFeedback()
  }, [tab])

  const loadMyFeedback = async () => {
    try {
      const { data } = await api.get('/api/feedback/my')
      setMyList(data || [])
    } catch {}
  }

  const handleSubmit = async () => {
    if (!message.trim()) return toast.error(t('required'))
    setLoading(true)
    try {
      await api.post('/api/feedback', { type, message, rating })
      toast.success(t('feedbackSent') + ' 👍')
      setMessage('')
      setRating(5)
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  // Tur va tab labellari
  const TYPES = [
    { value: 'taklif',   label: `💡 ${t('suggestion')}`, color: '#22c55e' },
    { value: 'shikoyat', label: `⚠️ ${t('complaint')}`,  color: '#f87171' },
  ]

  const TABS = [
    { key: 'new', label: `✏️ ${ lang === 'uz' ? 'Yangi' : lang === 'ru' ? 'Новое' : 'New' }` },
    { key: 'my',  label: `📋 ${t('myFeedback')}` },
  ]

  const locale = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[lang] || 'uz-UZ'

  return (
    <div style={{
      padding:   '28px 24px',
      overflowY: 'auto',
      height:    '100%',
      maxWidth:  '640px',
      margin:    '0 auto',
    }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   'var(--r-md)',
            background:     'rgba(124,58,237,0.15)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <ThumbsUp size={19} style={{ color: '#a78bfa' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            {t('feedback')}
          </h1>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          { lang === 'uz' && 'Fikr-mulohazalaringiz biz uchun muhim' }
          { lang === 'ru' && 'Ваши отзывы важны для нас' }
          { lang === 'en' && 'Your feedback matters to us' }
        </p>
      </div>

      {/* ── Tab tanlash ───────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        gap:          '4px',
        background:   'var(--surface)',
        padding:      '4px',
        borderRadius: 'var(--r-lg)',
        marginBottom: '20px',
        width:        'fit-content',
      }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding:      '8px 18px',
              borderRadius: 'var(--r-md)',
              border:       'none',
              cursor:       'pointer',
              fontSize:     '13px',
              fontWeight:   tab === key ? 700 : 400,
              background:   tab === key ? 'var(--accent)' : 'transparent',
              color:        tab === key ? 'white' : 'var(--text3)',
              fontFamily:   'var(--font)',
              transition:   'all .15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Yangi xabar yuborish ──────────────────────────────── */}
      {tab === 'new' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>

          {/* Tur tanlash */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    700,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {lang === 'uz' ? 'Tur' : lang === 'ru' ? 'Тип' : 'Type'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TYPES.map(item => (
                <button
                  key={item.value}
                  onClick={() => setType(item.value)}
                  style={{
                    padding:     '8px 20px',
                    borderRadius:'var(--r-xl)',
                    border:      `1px solid ${type === item.value ? item.color : 'var(--border)'}`,
                    cursor:      'pointer',
                    fontSize:    '13px',
                    fontWeight:  type === item.value ? 700 : 400,
                    background:  type === item.value ? `${item.color}18` : 'var(--surface)',
                    color:       type === item.value ? item.color : 'var(--text3)',
                    fontFamily:  'var(--font)',
                    transition:  'all .15s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reyting */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    700,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {t('rating')}
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Xabar maydoni */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    700,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              {lang === 'uz' ? 'Xabar' : lang === 'ru' ? 'Сообщение' : 'Message'}
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('writeFeedback')}
              rows={5}
              style={{
                width:        '100%',
                padding:      '12px 14px',
                background:   'var(--surface)',
                border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                color:        'var(--text)',
                fontSize:     '14px',
                resize:       'vertical',
                outline:      'none',
                fontFamily:   'var(--font)',
                boxSizing:    'border-box',
                lineHeight:   1.6,
                transition:   'border-color .2s, box-shadow .2s',
                boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
              }}
            />
          </div>

          {/* Yuborish tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              padding:        '12px 28px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              cursor:         loading || !message.trim() ? 'not-allowed' : 'pointer',
              background:     loading || !message.trim()
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          loading || !message.trim() ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              fontFamily:     'var(--font)',
              transition:     'all .2s',
              boxShadow:      loading || !message.trim()
                ? 'none'
                : '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{
                  width:          16,
                  height:         16,
                  border:         '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius:   '50%',
                  display:        'inline-block',
                }} />
                {t('loading')}
              </>
            ) : (
              <>
                <Send size={15} />
                {t('sendFeedback')}
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Mening xabarlarim ─────────────────────────────────── */}
      {tab === 'my' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          {myList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text3)' }}>
              <MessageCircle size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
              <div style={{ fontSize: '14px' }}>
                { lang === 'uz' && 'Hali xabar yuborilmagan' }
                { lang === 'ru' && 'Сообщений пока нет' }
                { lang === 'en' && 'No messages yet' }
              </div>
            </div>
          ) : (
            myList.map((item, i) => (
              <div
                key={item.id}
                style={{
                  background:   'var(--surface)',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                  padding:      '16px',
                  marginBottom: '12px',
                  animation:    `fadeIn 0.3s var(--ease) ${i * 50}ms both`,
                }}
              >
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  marginBottom:   '8px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    {item.type === 'taklif' ? `💡 ${t('suggestion')}` : `⚠️ ${t('complaint')}`}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {new Date(item.created_at * 1000).toLocaleDateString(locale)}
                  </span>
                </div>

                {/* Yulduzlar */}
                <div style={{ color: '#f59e0b', fontSize: '14px', marginBottom: '8px' }}>
                  {'★'.repeat(item.rating || 0)}
                  <span style={{ color: 'var(--surface3)' }}>{'★'.repeat(5 - (item.rating || 0))}</span>
                </div>

                <p style={{
                  fontSize:   '13px',
                  color:      'var(--text2)',
                  lineHeight: 1.6,
                  margin:     0,
                }}>
                  {item.message}
                </p>

                {/* Admin javobi */}
                {item.admin_reply && (
                  <div style={{
                    marginTop:    '12px',
                    padding:      '10px 12px',
                    borderRadius: 'var(--r-md)',
                    background:   'var(--accent-soft)',
                    borderLeft:   '3px solid var(--accent)',
                  }}>
                    <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600, marginBottom: '4px' }}>
                      {t('adminReply')}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
                      {item.admin_reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}