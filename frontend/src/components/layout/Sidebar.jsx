// src/components/layout/Sidebar.jsx  (yangilangan)
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  MessageSquare, Image, Settings, Bell, Crown,
  User, LogOut, Shield, FileText, ThumbsUp,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Bot, CheckSquare, AlarmClock, Zap
} from 'lucide-react'

const NAV = [
  { path: '/chat',          icon: MessageSquare,   label: 'Chat' },
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agent',         icon: Zap,             label: 'Agent' },
  { path: '/image',         icon: Image,           label: 'Rasm' },
  { path: '/files',         icon: FileText,        label: 'Fayllar' },
  { path: '/todo',          icon: CheckSquare,     label: 'Vazifalar' },
  { path: '/reminder',      icon: AlarmClock,      label: 'Eslatmalar' },
  { path: '/notifications', icon: Bell,            label: 'Bildirishnomalar' },
  { path: '/feedback',      icon: ThumbsUp,        label: 'Taklif & Shikoyat' },
  { path: '/premium',       icon: Crown,           label: 'Premium' },
  { path: '/settings',      icon: Settings,        label: 'Sozlamalar' },
  { path: '/profile',       icon: User,            label: 'Profil' },
]

const ADMIN_NAV = [
  { path: '/admin',       icon: Shield,          label: 'Admin Panel' },
  { path: '/admin/stats', icon: LayoutDashboard, label: 'Statistika' },
]

const EMOJIS = { bot:'🤖', cat:'🐱', fox:'🦊', robot:'🦾', alien:'👽', wizard:'🧙' }

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside style={{
      width:         collapsed ? '60px' : '220px',
      minWidth:      collapsed ? '60px' : '220px',
      background:    'var(--surface)',
      borderRight:   '1px solid var(--border)',
      display:       'flex',
      flexDirection: 'column',
      transition:    'width .2s, min-width .2s',
      overflow:      'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 14px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={17} color="white" />
        </div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>Alone AI</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display:      'flex',
            alignItems:   'center',
            gap:          '9px',
            padding:      '8px 10px',
            borderRadius: '10px',
            marginBottom: '1px',
            color:        isActive ? 'white' : 'var(--text3)',
            background:   isActive ? 'var(--accent)' : 'transparent',
            fontSize:     '13px',
            fontWeight:   isActive ? 600 : 400,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            transition:   'all .15s',
          })}>
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </NavLink>
        ))}

        {/* Admin */}
        {user?.is_admin && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px' }} />
            {ADMIN_NAV.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} style={({ isActive }) => ({
                display:      'flex',
                alignItems:   'center',
                gap:          '9px',
                padding:      '8px 10px',
                borderRadius: '10px',
                marginBottom: '1px',
                color:        isActive ? '#f59e0b' : 'var(--text3)',
                background:   isActive ? 'rgba(245,158,11,.12)' : 'transparent',
                fontSize:     '13px',
                fontWeight:   isActive ? 600 : 400,
                whiteSpace:   'nowrap',
                overflow:     'hidden',
              })}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>
        {/* User info */}
        {!collapsed && user && (
          <div style={{ padding: '8px 10px', marginBottom: '4px', borderRadius: '10px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{EMOJIS[user.avatar] || '👤'}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>{user.plan}</div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '10px', width: '100%', border: 'none', cursor: 'pointer', color: 'var(--error)', background: 'transparent', fontSize: '13px', whiteSpace: 'nowrap' }}>
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && 'Chiqish'}
        </button>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', borderRadius: '10px', width: '100%', border: 'none', cursor: 'pointer', color: 'var(--text3)', background: 'transparent', marginTop: '2px' }}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  )
}