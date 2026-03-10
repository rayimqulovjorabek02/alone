// src/components/layout/Header.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Bell, Search, Crown } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../api/client'

const ROUTE_TITLES = {
  '/chat':          '💬 Chat',
  '/dashboard':     '📊 Dashboard',
  '/image':         '🎨 Rasm',
  '/files':         '📄 Fayllar',
  '/notifications': '🔔 Bildirishnomalar',
  '/feedback':      '💬 Taklif & Shikoyat',
  '/premium':       '👑 Premium',
  '/settings':      '⚙️ Sozlamalar',
  '/profile':       '👤 Profil',
  '/agent':         '🤖 Agent',
  '/todo':          '✅ Vazifalar',
  '/reminder':      '🔔 Eslatmalar',
  '/admin':         '🛡️ Admin Panel',
  '/admin/stats':   '📊 Admin Statistika',
}

export default function Header() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [unread, setUnread] = useState(0)

  const title = ROUTE_TITLES[location.pathname] || 'Alone AI'

  useEffect(() => {
    api.get('/api/notifications/unread-count')
      .then(r => setUnread(r.data.count || 0))
      .catch(() => {})
  }, [location.pathname])

  return (
    <header style={{
      height:         '56px',
      minHeight:      '56px',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 20px',
      borderBottom:   '1px solid var(--border)',
      background:     'var(--bg)',
    }}>
      {/* Sarlavha */}
      <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h2>

      {/* O'ng tomon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

        {/* Plan badge */}
        {user?.plan !== 'premium' && (
          <button
            onClick={() => navigate('/premium')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(245,158,11,.3)', background: 'rgba(245,158,11,.08)', color: '#f59e0b', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Crown size={12} /> Premium
          </button>
        )}

        {/* Bildirishnomalar */}
        <button
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative', width: 36, height: 36, borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div
          onClick={() => navigate('/profile')}
          style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(124,58,237,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', border: '1px solid rgba(124,58,237,.3)' }}
        >
          {{ bot: '🤖', cat: '🐱', fox: '🦊', robot: '🦾', alien: '👽', wizard: '🧙' }[user?.avatar] || '👤'}
        </div>
      </div>
    </header>
  )
}