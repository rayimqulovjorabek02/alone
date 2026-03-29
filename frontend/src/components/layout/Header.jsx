// src/components/layout/Header.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore }             from '../../store/authStore'
import { useLang }                  from '../../i18n/LanguageContext'
import { Bell, Crown, Sun, Moon }   from 'lucide-react'
import { useState, useEffect }      from 'react'
import api                          from '../../api/client'

const ROUTE_TITLES = {
  uz: {
    '/chat': '💬 Chat', '/dashboard': '📊 Dashboard', '/image': '🎨 Rasm',
    '/files': '📄 Fayllar', '/notifications': '🔔 Bildirishnomalar',
    '/feedback': '💬 Taklif & Shikoyat', '/premium': '👑 Premium',
    '/settings': '⚙️ Sozlamalar', '/profile': '👤 Profil',
    '/agent': '🤖 Agent', '/todo': '✅ Vazifalar', '/reminder': '🔔 Eslatmalar',
    '/admin': '🛡️ Admin Panel', '/admin/stats': '📊 Admin Statistika',
  },
  ru: {
    '/chat': '💬 Чат', '/dashboard': '📊 Dashboard', '/image': '🎨 Изображения',
    '/files': '📄 Файлы', '/notifications': '🔔 Уведомления',
    '/feedback': '💬 Обратная связь', '/premium': '👑 Премиум',
    '/settings': '⚙️ Настройки', '/profile': '👤 Профиль',
    '/agent': '🤖 Агент', '/todo': '✅ Задачи', '/reminder': '🔔 Напоминания',
    '/admin': '🛡️ Admin Panel', '/admin/stats': '📊 Статистика',
  },
  en: {
    '/chat': '💬 Chat', '/dashboard': '📊 Dashboard', '/image': '🎨 Images',
    '/files': '📄 Files', '/notifications': '🔔 Notifications',
    '/feedback': '💬 Feedback', '/premium': '👑 Premium',
    '/settings': '⚙️ Settings', '/profile': '👤 Profile',
    '/agent': '🤖 Agent', '/todo': '✅ Tasks', '/reminder': '🔔 Reminders',
    '/admin': '🛡️ Admin Panel', '/admin/stats': '📊 Statistics',
  },
}

export default function Header() {
  const location              = useLocation()
  const navigate              = useNavigate()
  const { user }              = useAuthStore()
  const { lang }              = useLang()
  const [unread,  setUnread]  = useState(0)
  const [isDark,  setIsDark]  = useState(() =>
    (localStorage.getItem('theme') || 'dark') === 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then(r => setUnread(r.data.count || 0))
      .catch(() => {})
  }, [location.pathname])

  const titles = ROUTE_TITLES[lang] || ROUTE_TITLES.uz
  const title  = titles[location.pathname] || 'Alone AI'

  const iconBtn = (extra = {}) => ({
    width: 36, height: 36, borderRadius: 'var(--r-md)',
    border: 'none', cursor: 'pointer', background: 'transparent',
    color: 'var(--text3)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'background .15s, color .15s',
    position: 'relative', ...extra,
  })

  return (
    <header style={{
      height: '56px', minHeight: '56px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

        {user?.plan !== 'premium' && (
          <button onClick={() => navigate('/premium')} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
            border: '1px solid rgba(245,158,11,.3)', background: 'rgba(245,158,11,.08)',
            color: '#f59e0b', fontSize: '11px', fontWeight: 700, marginRight: '4px',
          }}>
            <Crown size={12} /> Premium
          </button>
        )}

        {/* Dark / Light toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          title={isDark
            ? (lang === 'ru' ? 'Светлая тема' : lang === 'en' ? 'Light mode' : 'Kunduzgi rejim')
            : (lang === 'ru' ? 'Тёмная тема'  : lang === 'en' ? 'Dark mode'  : 'Tungi rejim')
          }
          style={iconBtn()}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent';     e.currentTarget.style.color = 'var(--text3)' }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Bildirishnomalar */}
        <button
          onClick={() => navigate('/notifications')}
          style={iconBtn()}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent';     e.currentTarget.style.color = 'var(--text3)' }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--accent)', color: 'white',
              fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            width: 34, height: 34, borderRadius: '10px', cursor: 'pointer',
            background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', overflow: 'hidden', marginLeft: '2px',
          }}
        >
          {user?.avatar?.startsWith('data:image')
            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : ({ bot: '🤖', cat: '🐱', fox: '🦊', robot: '🦾', alien: '👽', wizard: '🧙' }[user?.avatar] || '👤')
          }
        </div>
      </div>
    </header>
  )
}