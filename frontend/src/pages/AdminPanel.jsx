// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useLang }             from '../i18n/LanguageContext'
import { Shield, Lock, Unlock, Trash2, Search, Users, MessageSquare, Star, Check, X } from 'lucide-react'

const PLANS = ['free', 'pro', 'premium']

export default function AdminPanel() {
  const [tab,      setTab]     = useState('users')
  const [users,    setUsers]   = useState([])
  const [feedback, setFeedback]= useState([])
  const [subs,     setSubs]    = useState([])
  const [search,   setSearch]  = useState('')
  const [loading,  setLoading] = useState(true)
  const { t, lang }            = useLang()

  useEffect(() => {
    loadUsers()
    loadFeedback()
    loadSubs()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/api/admin/users')
      setUsers(data || [])
    } catch { toast.error(t('error')) }
    finally { setLoading(false) }
  }

  const loadFeedback = async () => {
    try {
      const { data } = await api.get('/api/feedback/admin/all')
      setFeedback(data || [])
    } catch {}
  }

  const loadSubs = async () => {
    try {
      const { data } = await api.get('/api/payments/requests')
      setSubs(data || [])
    } catch {}
  }

  const setPlan = async (id, plan) => {
    try {
      await api.put(`/api/admin/users/${id}/plan?plan=${plan}`)
      setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x))
      toast.success(lang === 'ru' ? 'Тариф изменён' : lang === 'en' ? 'Plan updated' : "Plan o'zgartirildi")
    } catch { toast.error(t('error')) }
  }

  const toggleBlock = async (id) => {
    try {
      const { data } = await api.put(`/api/admin/users/${id}/block`)
      setUsers(u => u.map(x => x.id === id ? { ...x, is_active: data.is_active ? 1 : 0 } : x))
    } catch { toast.error(t('error')) }
  }

  const deleteUser = async (id) => {
    if (!confirm(lang === 'ru' ? 'Подтвердите удаление?' : lang === 'en' ? 'Confirm delete?' : "O'chirishni tasdiqlaysizmi?")) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      setUsers(u => u.filter(x => x.id !== id))
      toast.success(t('success'))
    } catch { toast.error(t('error')) }
  }

  const replyFeedback = async (id, reply) => {
    const text = prompt(lang === 'ru' ? 'Ответ:' : lang === 'en' ? 'Reply:' : 'Javob:')
    if (!text) return
    try {
      await api.put(`/api/feedback/admin/${id}`, { reply: text, status: 'answered' })
      setFeedback(f => f.map(x => x.id === id ? { ...x, admin_reply: text, status: 'answered' } : x))
      toast.success(t('success'))
    } catch { toast.error(t('error')) }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const TABLE_HEADERS = {
    uz: ['ID', 'Foydalanuvchi', 'Email', 'Plan', 'Holat', 'Amallar'],
    ru: ['ID', 'Пользователь', 'Email', 'Тариф', 'Статус', 'Действия'],
    en: ['ID', 'User', 'Email', 'Plan', 'Status', 'Actions'],
  }
  const headers = TABLE_HEADERS[lang] || TABLE_HEADERS.uz

  const TYPE_COLORS = { suggestion: '#60a5fa', complaint: '#f87171', question: '#a78bfa', other: '#94a3b8' }
  const TYPE_LABELS = {
    suggestion: { uz: 'Taklif',    ru: 'Предложение', en: 'Suggestion' },
    complaint:  { uz: 'Shikoyat',  ru: 'Жалоба',      en: 'Complaint' },
    question:   { uz: 'Savol',     ru: 'Вопрос',       en: 'Question' },
    other:      { uz: 'Boshqa',    ru: 'Другое',       en: 'Other' },
  }

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={19} style={{ color: '#f59e0b' }} />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Admin Panel</h1>
      </div>

      {/* ── Tablar ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'users',    icon: <Users size={14}/>,         label: lang === 'ru' ? `Пользователи (${users.length})` : lang === 'en' ? `Users (${users.length})` : `Foydalanuvchilar (${users.length})` },
          { key: 'feedback', icon: <MessageSquare size={14}/>, label: lang === 'ru' ? `Обратная связь (${feedback.length})` : lang === 'en' ? `Feedback (${feedback.length})` : `Fikrlar (${feedback.length})` },
          { key: 'subs',     icon: <span style={{fontSize:14}}>👑</span>, label: lang === 'ru' ? `Подписки (${subs.filter(s=>s.status==='pending').length})` : lang === 'en' ? `Subscriptions (${subs.filter(s=>s.status==='pending').length})` : `Obunalar (${subs.filter(s=>s.status==='pending').length})` },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: 'var(--r-lg)',
              border: `1px solid ${tab === key ? 'var(--accent)' : 'var(--border)'}`,
              background: tab === key ? 'var(--accent-soft)' : 'var(--surface)',
              color: tab === key ? '#a78bfa' : 'var(--text3)',
              fontSize: '13px', fontWeight: tab === key ? 700 : 400,
              cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
            }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── Foydalanuvchilar tab ─────────────────────────────── */}
      {tab === 'users' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('search') + '...'}
              style={{ width: '100%', padding: '9px 12px 9px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--r-md)' }} />)}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text3)' }}>
                    {headers.map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: '11px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} style={{ background: 'var(--surface)', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                    >
                      <td style={{ padding: '10px 12px', borderRadius: 'var(--r-md) 0 0 var(--r-md)', color: 'var(--text3)', fontSize: '12px' }}>{u.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        {u.username}
                        {u.is_admin && <span style={{ color: '#f59e0b', marginLeft: 6, fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '100px' }}>ADMIN</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text3)' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <select value={u.plan} onChange={e => setPlan(u.id, e.target.value)}
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--text2)', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', background: u.is_active ? 'var(--success-soft)' : 'var(--error-soft)', color: u.is_active ? 'var(--success)' : 'var(--error)' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          {u.is_active ? (lang === 'uz' ? 'Faol' : lang === 'ru' ? 'Активен' : 'Active') : (lang === 'uz' ? 'Bloklangan' : lang === 'ru' ? 'Заблокирован' : 'Blocked')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', borderRadius: '0 var(--r-md) var(--r-md) 0' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => toggleBlock(u.id)}
                            style={{ padding: '5px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--surface3)', color: u.is_active ? 'var(--warning)' : 'var(--success)', display: 'flex', transition: 'all .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface3)'}
                          >
                            {u.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button onClick={() => deleteUser(u.id)}
                            style={{ padding: '5px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', background: 'var(--surface3)', color: 'var(--error)', display: 'flex', transition: 'all .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--error-soft)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface3)'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)' }}>
                      <Users size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                      {lang === 'uz' ? 'Topilmadi' : lang === 'ru' ? 'Не найдено' : 'Not found'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Feedback tab ─────────────────────────────────────── */}
      {tab === 'feedback' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          {feedback.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <div>{lang === 'uz' ? "Hali fikr yo'q" : lang === 'ru' ? 'Пока нет отзывов' : 'No feedback yet'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {feedback.map(f => (
                <div key={f.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: '16px',
                  borderLeft: `3px solid ${TYPE_COLORS[f.type] || '#94a3b8'}`,
                  animation: 'fadeIn 0.3s var(--ease)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: `${TYPE_COLORS[f.type]}20`, color: TYPE_COLORS[f.type] }}>
                        {TYPE_LABELS[f.type]?.[lang] || f.type}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        👤 {f.username}
                      </span>
                      {f.rating > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: '#f59e0b' }}>
                          {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
                        {new Date(f.created_at * 1000).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ')}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                        background: f.status === 'answered' ? 'var(--success-soft)' : 'var(--surface2)',
                        color: f.status === 'answered' ? 'var(--success)' : 'var(--text3)',
                      }}>
                        {f.status === 'answered'
                          ? (lang === 'uz' ? 'Javob berildi' : lang === 'ru' ? 'Отвечено' : 'Answered')
                          : (lang === 'uz' ? 'Yangi' : lang === 'ru' ? 'Новый' : 'New')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Xabar */}
                  <p style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6, margin: '0 0 10px' }}>
                    {f.message}
                  </p>

                  {/* Admin javobi */}
                  {f.admin_reply && (
                    <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-lg)', padding: '10px 14px', marginBottom: '10px', borderLeft: '2px solid var(--accent)' }}>
                      <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, marginBottom: '4px' }}>
                        {lang === 'uz' ? 'Admin javobi' : lang === 'ru' ? 'Ответ администратора' : 'Admin reply'}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: 1.6 }}>
                        {f.admin_reply}
                      </p>
                    </div>
                  )}

                  {/* Javob berish tugmasi */}
                  {f.status !== 'answered' && (
                    <button
                      onClick={() => replyFeedback(f.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: 'var(--r-md)',
                        border: '1px solid var(--accent)', background: 'var(--accent-soft)',
                        color: '#a78bfa', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s',
                      }}
                    >
                      <Check size={13} />
                      {lang === 'uz' ? 'Javob berish' : lang === 'ru' ? 'Ответить' : 'Reply'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* ── Obunalar tab ─────────────────────────────────────── */}
      {tab === 'subs' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          {subs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.3 }}>👑</span>
              <div>{lang === 'uz' ? "Obuna so'rovlari yo'q" : lang === 'ru' ? 'Запросов нет' : 'No requests'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subs.map(s => (
                <div key={s.id} style={{
                  background:   'var(--surface)',
                  border:       `1px solid ${s.status === 'pending' ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-xl)',
                  padding:      '16px',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '14px',
                  flexWrap:     'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>{s.username}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{s.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '100px' }}>
                        👑 {s.plan}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
                        background: s.status === 'pending' ? 'rgba(245,158,11,0.1)' : s.status === 'approved' ? 'var(--success-soft)' : 'var(--error-soft)',
                        color: s.status === 'pending' ? '#f59e0b' : s.status === 'approved' ? 'var(--success)' : 'var(--error)',
                      }}>
                        {s.status === 'pending'  ? (lang === 'uz' ? 'Kutilmoqda' : lang === 'ru' ? 'Ожидает' : 'Pending') :
                         s.status === 'approved' ? (lang === 'uz' ? 'Tasdiqlandi' : lang === 'ru' ? 'Одобрено' : 'Approved') :
                                                   (lang === 'uz' ? 'Rad etildi'  : lang === 'ru' ? 'Отклонено' : 'Rejected')}
                      </span>
                    </div>
                    {s.note && <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>"{s.note}"</div>}
                  </div>

                  {s.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/api/payments/requests/${s.id}/approve`)
                            toast.success(lang === 'uz' ? 'Plan yangilandi!' : lang === 'ru' ? 'План обновлён!' : 'Plan updated!')
                            loadSubs(); loadUsers()
                          } catch { toast.error(t('error')) }
                        }}
                        style={{ padding: '7px 16px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: 'var(--success)', color: 'white', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)' }}
                      >
                        ✓ {lang === 'uz' ? 'Tasdiqlash' : lang === 'ru' ? 'Одобрить' : 'Approve'}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/api/payments/requests/${s.id}/reject`)
                            toast.success(t('success'))
                            loadSubs()
                          } catch { toast.error(t('error')) }
                        }}
                        style={{ padding: '7px 12px', borderRadius: 'var(--r-md)', border: 'none', cursor: 'pointer', background: 'var(--error-soft)', color: 'var(--error)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font)' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}