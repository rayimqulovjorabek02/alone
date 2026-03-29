// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuthStore }        from '../store/authStore'
import { useLang }             from '../i18n/LanguageContext'
import api                     from '../api/client'
import {
  MessageSquare, Image, TrendingUp, CheckSquare,
  Clock, ArrowRight, Zap, Crown, Sparkles,
} from 'lucide-react'


// ── Vaqtni formatlash ─────────────────────────────────────────
function timeAgo(ts, lang) {
  if (!ts) return ''
  const diff = Date.now() / 1000 - ts

  if (lang === 'ru') {
    if (diff < 60)    return 'Только что'
    if (diff < 3600)  return `${Math.floor(diff / 60)} мин назад`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
    return `${Math.floor(diff / 86400)} д назад`
  }
  if (lang === 'en') {
    if (diff < 60)    return 'Just now'
    if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`
    return `${Math.floor(diff / 86400)} d ago`
  }
  // uz (default)
  if (diff < 60)    return 'Hozir'
  if (diff < 3600)  return `${Math.floor(diff / 60)} daqiqa oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  return `${Math.floor(diff / 86400)} kun oldin`
}


// ── Progress bar komponenti ───────────────────────────────────
function ProgressBar({ value, max, color }) {
  const pct    = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isHigh = pct >= 80

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{
        height:       '4px',
        background:   'var(--surface3)',
        borderRadius: '4px',
        overflow:     'hidden',
      }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          borderRadius: '4px',
          background:   isHigh ? 'var(--error)' : color,
          transition:   'width 0.8s var(--ease)',
        }} />
      </div>
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        marginTop:      '5px',
        fontSize:       '11px',
        color:          isHigh ? 'var(--error)' : 'var(--text3)',
      }}>
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}


// ── Stat karta komponenti ─────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg, progress, delay }) {
  return (
    <div
      style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding:      '20px',
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width:          40,
          height:         40,
          borderRadius:   'var(--r-md)',
          background:     bg,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Icon size={19} style={{ color }} />
        </div>

        {sub && (
          <span style={{
            fontSize:     '11px',
            padding:      '3px 8px',
            borderRadius: '100px',
            background:   bg,
            color,
            fontWeight:   600,
          }}>
            {sub}
          </span>
        )}
      </div>

      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '26px', fontWeight: 800, color, letterSpacing: '-0.5px' }}>
          {value}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '3px', fontWeight: 500 }}>
          {label}
        </div>
      </div>

      {progress && <ProgressBar {...progress} color={color} />}
    </div>
  )
}


// ── Plan info ─────────────────────────────────────────────────
const PLAN_INFO = {
  free:    { color: 'var(--text3)', bg: 'var(--surface3)',        icon: Sparkles },
  pro:     { color: '#a78bfa',      bg: 'var(--accent-soft)',     icon: Zap },
  premium: { color: '#fcd34d',      bg: 'rgba(245,158,11,0.12)', icon: Crown },
}


export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [activity, setActivity] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { user }                = useAuthStore()
  const { t, lang }             = useLang()
  const navigate                = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/dashboard/activity'),
    ]).then(([s, a]) => {
      setStats(s.data)
      setActivity(a.data || [])
    }).finally(() => setLoading(false))
  }, [])

  // ── Skeleton yuklanmoqda ───────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '28px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 120, height: 16 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 20 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', marginBottom: 14 }} />
              <div className="skeleton" style={{ width: 70, height: 28, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 130, height: 13 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ padding: 40, color: 'var(--text3)', textAlign: 'center' }}>
        {t('error')}
      </div>
    )
  }

  const plan     = stats.plan || 'free'
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.free
  const PlanIcon = planInfo.icon

  const todoPct = stats.todos_done + stats.todos_pending > 0
    ? Math.round((stats.todos_done / (stats.todos_done + stats.todos_pending)) * 100)
    : 0

  const QUICK_ACTIONS = [
    { label: t('startNewChat'),  path: '/chat',     emoji: '💬', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    { label: t('createImage'),   path: '/image',    emoji: '🎨', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
    { label: t('useAgent'),      path: '/agent',    emoji: '⚡', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
    { label: t('analyzeFile'),   path: '/files',    emoji: '📄', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    { label: t('addTask'),       path: '/todo',     emoji: '✅', color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
    { label: t('addReminder'),   path: '/reminder', emoji: '🔔', color: '#e879f9', bg: 'rgba(232,121,249,0.08)' },
  ]

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%' }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   '28px',
        animation:      'fadeIn 0.3s var(--ease)',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            {t('hello')}, {user?.username} 👋
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '13px', marginTop: '4px' }}>
            {t('todayActivity')}
          </p>
        </div>

        {/* Plan badge */}
        <div
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '7px',
            padding:     '8px 14px',
            borderRadius: 'var(--r-xl)',
            background:   planInfo.bg,
            border:       `1px solid ${planInfo.color}30`,
            cursor:       plan !== 'premium' ? 'pointer' : 'default',
            transition:   'opacity .15s',
          }}
          onClick={() => plan !== 'premium' && navigate('/premium')}
          onMouseEnter={e => { if (plan !== 'premium') e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <PlanIcon size={15} style={{ color: planInfo.color }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: planInfo.color }}>
            {t(plan) || plan}
          </span>
          {plan !== 'premium' && (
            <ArrowRight size={13} style={{ color: planInfo.color, opacity: 0.7 }} />
          )}
        </div>
      </div>

      {/* ── Stat kartalar ────────────────────────────────────── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap:                 '14px',
        marginBottom:        '24px',
      }}>
        <StatCard
          icon={MessageSquare}
          label={t('todayMessages')}
          value={stats.messages_today}
          color="#a78bfa"
          bg="rgba(167,139,250,0.1)"
          delay={0}
          progress={{ value: stats.messages_today, max: stats.messages_limit }}
        />
        <StatCard
          icon={Image}
          label={t('todayImages')}
          value={stats.images_today}
          color="#34d399"
          bg="rgba(52,211,153,0.1)"
          delay={80}
          progress={{ value: stats.images_today, max: stats.images_limit }}
        />
        <StatCard
          icon={TrendingUp}
          label={t('totalChats')}
          value={stats.total_sessions}
          sub={`${stats.total_messages}`}
          color="#60a5fa"
          bg="rgba(96,165,250,0.1)"
          delay={160}
        />
        <StatCard
          icon={CheckSquare}
          label={t('completedTasks')}
          value={`${stats.todos_done}/${stats.todos_done + stats.todos_pending}`}
          sub={`${todoPct}%`}
          color="#f59e0b"
          bg="rgba(245,158,11,0.1)"
          delay={240}
        />
      </div>

      {/* ── Pastki qator ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* So'nggi suhbatlar */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding:      '20px',
          animation:    'fadeIn 0.5s var(--ease) 300ms both',
        }}>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   '16px',
          }}>
            <h2 style={{
              fontSize:   '14px',
              fontWeight: 700,
              display:    'flex',
              alignItems: 'center',
              gap:        '7px',
            }}>
              <Clock size={15} style={{ color: 'var(--text3)' }} />
              {t('recentChats')}
            </h2>
            <button
              onClick={() => navigate('/chat')}
              style={{
                fontSize:   '12px',
                color:      '#a78bfa',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              {t('viewAll')}
            </button>
          </div>

          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
              <p style={{ color: 'var(--text3)', fontSize: '13px' }}>{t('noChatsYet')}</p>
              <button
                onClick={() => navigate('/chat')}
                style={{
                  marginTop:    '12px',
                  padding:      '7px 14px',
                  borderRadius: 'var(--r-md)',
                  border:       'none',
                  background:   'var(--accent-soft)',
                  color:        '#a78bfa',
                  fontSize:     '12px',
                  fontWeight:   600,
                  cursor:       'pointer',
                  fontFamily:   'var(--font)',
                }}
              >
                {t('startNewChat')}
              </button>
            </div>
          ) : (
            activity.map((s, i) => (
              <div
                key={s.id}
                onClick={() => navigate('/chat')}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '10px',
                  borderRadius:   'var(--r-md)',
                  cursor:         'pointer',
                  transition:     'background .15s',
                  borderBottom:   i < activity.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize:     '13px',
                    fontWeight:   500,
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}>
                    {s.title || t('newChat')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                    {timeAgo(s.updated_at, lang)}
                  </div>
                </div>
                <span style={{
                  fontSize:     '11px',
                  color:        'var(--text3)',
                  background:   'var(--surface3)',
                  padding:      '2px 7px',
                  borderRadius: '100px',
                  marginLeft:   '10px',
                  flexShrink:   0,
                }}>
                  {s.msg_count}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Tezkor harakatlar */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding:      '20px',
          animation:    'fadeIn 0.5s var(--ease) 380ms both',
        }}>
          <h2 style={{
            fontSize:    '14px',
            fontWeight:  700,
            marginBottom:'16px',
            display:     'flex',
            alignItems:  'center',
            gap:         '7px',
          }}>
            <Zap size={15} style={{ color: 'var(--text3)' }} />
            {t('quickActions')}
          </h2>

          {QUICK_ACTIONS.map(({ label, path, emoji, color, bg }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '10px',
                width:       '100%',
                padding:     '9px 10px',
                borderRadius:'var(--r-md)',
                border:      'none',
                background:  'transparent',
                cursor:      'pointer',
                fontSize:    '13px',
                color:       'var(--text2)',
                fontFamily:  'var(--font)',
                textAlign:   'left',
                transition:  'background .15s, color .15s',
                marginBottom:'2px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = bg
                e.currentTarget.style.color      = color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color      = 'var(--text2)'
              }}
            >
              <span style={{ fontSize: '16px', width: 24, textAlign: 'center' }}>{emoji}</span>
              {label}
              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}