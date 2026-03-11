// src/components/layout/Sidebar.jsx — To'liq versiya (DevPanel qo'shilgan)
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  MessageSquare, Image, Settings, Bell, Crown,
  User, LogOut, Shield, FileText, ThumbsUp,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Bot, CheckSquare, AlarmClock, Zap, Terminal,
} from 'lucide-react'

// ── Navigatsiya elementlari ───────────────────────────────────
const NAV_ITEMS = [
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

// Admin va dasturchi uchun alohida bo'lim
const ADMIN_ITEMS = [
  { path: '/admin',       icon: Shield,          label: 'Admin Panel' },
  { path: '/admin/stats', icon: LayoutDashboard, label: 'Statistika' },
  { path: '/dev',         icon: Terminal,        label: 'Dev Panel' },
]

// Avatar emoji lug'ati
const AVATAR_EMOJIS = {
  bot:    '🤖',
  cat:    '🐱',
  fox:    '🦊',
  robot:  '🦾',
  alien:  '👽',
  wizard: '🧙',
}


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ── Nav elementi stili ──────────────────────────────────────
  const navStyle = (isActive, activeColor = 'var(--accent)', activeBg = 'var(--accent)') => ({
    display:      'flex',
    alignItems:   'center',
    gap:          '9px',
    padding:      '8px 10px',
    borderRadius: '10px',
    marginBottom: '1px',
    color:        isActive ? 'white' : 'var(--text3)',
    background:   isActive ? activeBg : 'transparent',
    fontSize:     '13px',
    fontWeight:   isActive ? 600 : 400,
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    transition:   'all .15s',
    textDecoration: 'none',
  })

  const adminNavStyle = (isActive) => ({
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
    transition:   'all .15s',
    textDecoration: 'none',
  })

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

      {/* ── Logo ──────────────────────────────────────────── */}
      <div style={{
        padding:     '18px 14px 14px',
        display:     'flex',
        alignItems:  'center',
        gap:         '10px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width:           32,
          height:          32,
          borderRadius:    '10px',
          background:      'linear-gradient(135deg,#7c3aed,#6d28d9)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
        }}>
          <Bot size={17} color="white" />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>
            Alone AI
          </span>
        )}
      </div>

      {/* ── Navigatsiya ───────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>

        {/* Asosiy menyu */}
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => navStyle(isActive)}>
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && label}
          </NavLink>
        ))}

        {/* Admin bo'limi — faqat adminlarga ko'rsatish */}
        {user?.is_admin && (
          <>
            <div style={{
              height:     1,
              background: 'var(--border)',
              margin:     '8px 4px',
            }} />

            {/* "Admin" yozuvi */}
            {!collapsed && (
              <div style={{
                fontSize:    '10px',
                fontWeight:  700,
                color:       'var(--text3)',
                padding:     '4px 10px 6px',
                letterSpacing: '0.5px',
              }}>
                ADMIN
              </div>
            )}

            {ADMIN_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink key={path} to={path} style={({ isActive }) => adminNavStyle(isActive)}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px' }}>

        {/* Foydalanuvchi ma'lumoti */}
        {!collapsed && user && (
          <div style={{
            padding:      '8px 10px',
            marginBottom: '4px',
            borderRadius: '10px',
            background:   'var(--surface2)',
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
          }}>
            <span style={{ fontSize: '20px' }}>
              {AVATAR_EMOJIS[user.avatar] || '👤'}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize:     '12px',
                fontWeight:   600,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}>
                {user.username}
              </div>
              <div style={{
                fontSize:       '10px',
                color:          'var(--text3)',
                textTransform:  'uppercase',
                letterSpacing:  '0.3px',
              }}>
                {user.plan}
                {user.is_admin && (
                  <span style={{ color: '#f59e0b', marginLeft: '4px' }}>• ADMIN</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chiqish tugmasi */}
        <button
          onClick={handleLogout}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '9px',
            padding:     '8px 10px',
            borderRadius:'10px',
            width:       '100%',
            border:      'none',
            cursor:      'pointer',
            color:       'var(--error)',
            background:  'transparent',
            fontSize:    '13px',
            fontFamily:  'inherit',
            whiteSpace:  'nowrap',
          }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && 'Chiqish'}
        </button>

        {/* Yig'ish / yoyish tugmasi */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            padding:         '7px',
            borderRadius:    '10px',
            width:           '100%',
            border:          'none',
            cursor:          'pointer',
            color:           'var(--text3)',
            background:      'transparent',
            marginTop:       '2px',
          }}
          title={collapsed ? 'Kengaytirish' : 'Yig\'ish'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  )
}