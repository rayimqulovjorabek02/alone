// src/pages/AdminStats.jsx
import { useState, useEffect } from 'react'
import api                     from '../api/client'
import { useLang }             from '../i18n/LanguageContext'
import { Users, MessageSquare, Image, TrendingUp, BarChart2, UserCheck, Calendar, MessageCircle } from 'lucide-react'


// ── Stat karta ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg, delay }) {
  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding:      '18px',
      animation:    `fadeIn 0.4s var(--ease) ${delay || 0}ms both`,
      transition:   'border-color .2s, transform .2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--border2)'
      e.currentTarget.style.transform   = 'translateY(-2px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.transform   = 'translateY(0)'
    }}
    >
      <div style={{
        width:          38,
        height:         38,
        borderRadius:   'var(--r-md)',
        background:     bg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        marginBottom:   '12px',
      }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color, letterSpacing: '-0.5px' }}>
        {value?.toLocaleString() ?? '—'}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}


export default function AdminStats() {
  const [stats,  setStats]  = useState(null)
  const [loading,setLoading]= useState(true)
  const { lang }            = useLang()

  useEffect(() => {
    api.get('/api/admin-stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // ── Tarjimalar ────────────────────────────────────────────
  const labels = {
    totalUsers: { uz: 'Jami foydalanuvchilar', ru: 'Всего пользователей', en: 'Total users' },
    todayActive:{ uz: 'Bugun faol',            ru: 'Активны сегодня',     en: 'Active today' },
    totalMsgs:  { uz: 'Jami xabarlar',         ru: 'Всего сообщений',     en: 'Total messages' },
    totalImgs:  { uz: 'Jami rasmlar',          ru: 'Всего изображений',   en: 'Total images' },
    byPlan:     { uz: "Planlar bo'yicha",       ru: 'По тарифам',          en: 'By plan' },
    summary:    { uz: 'Xulosa',                ru: 'Итоги',               en: 'Summary' },
    activeUsers:{ uz: 'Faol foydalanuvchilar', ru: 'Активные пользователи',en: 'Active users' },
    newThisWeek:{ uz: 'Bu hafta yangi',        ru: 'Новых за неделю',     en: 'New this week' },
    newFeedback:{ uz: 'Yangi shikoyatlar',     ru: 'Новые жалобы',        en: 'New feedback' },
    totalSess:  { uz: 'Jami sessiyalar',       ru: 'Всего сессий',        en: 'Total sessions' },
  }
  const L = (key) => labels[key]?.[lang] || labels[key]?.uz || key

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 18 }}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 70, height: 28, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: 120, height: 13 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ padding: 40, color: 'var(--text3)', textAlign: 'center' }}>
        { lang === 'uz' ? "Ma'lumot yuklanmadi" : lang === 'ru' ? 'Данные не загружены' : 'No data' }
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={19} style={{ color: '#60a5fa' }} />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>
          { lang === 'uz' ? 'Admin Statistika' : lang === 'ru' ? 'Статистика' : 'Statistics' }
        </h1>
      </div>

      {/* ── Asosiy kartalar ───────────────────────────────────── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap:                 '12px',
        marginBottom:        '20px',
      }}>
        <StatCard icon={Users}         label={L('totalUsers')}  value={stats.total_users}    color="#a78bfa" bg="rgba(167,139,250,0.1)" delay={0} />
        <StatCard icon={TrendingUp}    label={L('todayActive')} value={stats.today_active}   color="#34d399" bg="rgba(52,211,153,0.1)"  delay={80} />
        <StatCard icon={MessageSquare} label={L('totalMsgs')}   value={stats.total_messages} color="#60a5fa" bg="rgba(96,165,250,0.1)"  delay={160} />
        <StatCard icon={Image}         label={L('totalImgs')}   value={stats.total_images}   color="#f59e0b" bg="rgba(245,158,11,0.1)"  delay={240} />
      </div>

      {/* ── Pastki 2 karta ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Planlar bo'yicha */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding:      '18px',
          animation:    'fadeIn 0.5s var(--ease) 300ms both',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Users size={14} style={{ color: 'var(--text3)' }} />
            {L('byPlan')}
          </h3>
          {Object.entries(stats.plans || {}).map(([plan, count]) => {
            const colors = { free: 'var(--text3)', pro: '#a78bfa', premium: '#fcd34d' }
            const pct    = stats.total_users > 0 ? (count / stats.total_users * 100).toFixed(0) : 0
            return (
              <div key={plan} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text2)', textTransform: 'uppercase', fontWeight: 600 }}>{plan}</span>
                  <span style={{ fontWeight: 700, color: colors[plan] || 'var(--text)' }}>{count}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--surface3)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height:       '100%',
                    width:        `${pct}%`,
                    background:   colors[plan] || 'var(--accent)',
                    borderRadius: '4px',
                    transition:   'width 0.8s var(--ease)',
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Xulosa */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding:      '18px',
          animation:    'fadeIn 0.5s var(--ease) 380ms both',
        }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <BarChart2 size={14} style={{ color: 'var(--text3)' }} />
            {L('summary')}
          </h3>
          {[
            { label: L('activeUsers'), value: stats.active_users,   icon: UserCheck,      color: '#34d399' },
            { label: L('newThisWeek'), value: stats.new_users_week,  icon: Calendar,       color: '#60a5fa' },
            { label: L('newFeedback'), value: stats.feedback_new,    icon: MessageCircle,  color: '#f87171' },
            { label: L('totalSess'),   value: stats.total_sessions,  icon: MessageSquare,  color: '#a78bfa' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '7px 0',
                borderBottom:   '1px solid var(--border)',
                fontSize:       '13px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text2)' }}>
                <Icon size={13} style={{ color }} />
                {label}
              </span>
              <span style={{ fontWeight: 700, color }}>
                {value?.toLocaleString() ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}