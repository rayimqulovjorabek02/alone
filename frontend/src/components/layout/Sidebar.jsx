// src/components/layout/Sidebar.jsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  MessageSquare, Image, Settings, Bell, Crown,
  User, LogOut, Shield, FileText, ThumbsUp,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Bot, CheckSquare, AlarmClock, Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/chat',          icon: MessageSquare,   label: 'Chat',            section: 'main' },
  { path: '/agent',         icon: Zap,             label: 'Agent',           section: 'main' },
  { path: '/image',         icon: Image,           label: 'Rasm',            section: 'main' },
  { path: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',       section: 'tools' },
  { path: '/files',         icon: FileText,        label: 'Fayllar',         section: 'tools' },
  { path: '/todo',          icon: CheckSquare,     label: 'Vazifalar',       section: 'tools' },
  { path: '/reminder',      icon: AlarmClock,      label: 'Eslatmalar',      section: 'tools' },
  { path: '/notifications', icon: Bell,            label: 'Bildirishnomalar',section: 'other' },
  { path: '/premium',       icon: Crown,           label: 'Premium',         section: 'other' },
  { path: '/feedback',      icon: ThumbsUp,        label: 'Taklif',          section: 'other' },
  { path: '/settings',      icon: Settings,        label: 'Sozlamalar',      section: 'other' },
  { path: '/profile',       icon: User,            label: 'Profil',          section: 'other' },
]

const ADMIN_ITEMS = [
  { path: '/admin',       icon: Shield,          label: 'Admin Panel' },
  { path: '/admin/stats', icon: LayoutDashboard, label: 'Statistika' },
]

const SECTIONS = [
  { key: 'main',  label: 'Asosiy' },
  { key: 'tools', label: 'Vositalar' },
  { key: 'other', label: 'Boshqa' },
]

const AVATARS = {
  bot:    '🤖', cat: '🐱', fox: '🦊',
  robot:  '🦾', alien: '👽', wizard: '🧙',
}

const PLAN_COLORS = {
  free:    { bg: 'rgba(255,255,255,0.06)', color: 'var(--text3)' },
  pro:     { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa' },
  premium: { bg: 'rgba(245,158,11,0.15)',  color: '#fcd34d' },
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const planStyle = PLAN_COLORS[user?.plan] || PLAN_COLORS.free

  return (
    <aside style={{
      width:         collapsed ? '58px' : '220px',
      minWidth:      collapsed ? '58px' : '220px',
      background:    'var(--surface)',
      borderRight:   '1px solid var(--border)',
      display:       'flex',
      flexDirection: 'column',
      transition:    'width .25s var(--ease), min-width .25s var(--ease)',
      overflow:      'hidden',
    }}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div style={{
        padding:      '16px 12px',
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        borderBottom: '1px solid var(--border)',
        minHeight:    '60px',
      }}>
        <div style={{
          width:          34,
          height:         34,
          borderRadius:   '10px',
          background:     'linear-gradient(135deg, #7c3aed, #5b21b6)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          boxShadow:      '0 4px 12px rgba(124,58,237,0.35)',
        }}>
          <Bot size={16} color="white" />
        </div>
        {!collapsed && (
          <span style={{
            fontWeight:    800,
            fontSize:      '15px',
            letterSpacing: '-0.4px',
            whiteSpace:    'nowrap',
            animation:     'fadeIn 0.2s var(--ease)',
          }}>
            Alone <span className="text-gradient">AI</span>
          </span>
        )}
      </div>

      {/* ── Navigatsiya ──────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>

        {SECTIONS.map(({ key, label }) => {
          const items = NAV_ITEMS.filter(i => i.section === key)
          return (
            <div key={key} style={{ marginBottom: '4px' }}>
              {/* Bo'lim nomi */}
              {!collapsed && (
                <div style={{
                  fontSize:      '10px',
                  fontWeight:    700,
                  color:         'var(--text3)',
                  padding:       '8px 8px 4px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                }}>
                  {label}
                </div>
              )}
              {collapsed && key !== 'main' && (
                <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
              )}

              {items.map(({ path, icon: Icon, label: itemLabel }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? itemLabel : undefined}
                  style={({ isActive }) => ({
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '9px',
                    padding:        collapsed ? '9px' : '8px 10px',
                    borderRadius:   'var(--r-md)',
                    marginBottom:   '1px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color:          isActive ? 'white' : 'var(--text2)',
                    background:     isActive ? 'var(--accent)' : 'transparent',
                    fontSize:       '13px',
                    fontWeight:     isActive ? 600 : 400,
                    whiteSpace:     'nowrap',
                    textDecoration: 'none',
                    transition:     'all .15s',
                    boxShadow:      isActive ? '0 2px 8px var(--accent-glow)' : 'none',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}
                      />
                      {!collapsed && itemLabel}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}

        {/* Admin bo'limi */}
        {user?.is_admin && (
          <div style={{ marginTop: '4px' }}>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 4px 8px' }} />
            {!collapsed && (
              <div style={{
                fontSize:      '10px',
                fontWeight:    700,
                color:         '#f59e0b',
                padding:       '0 8px 4px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}>
                Admin
              </div>
            )}
            {ADMIN_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                style={({ isActive }) => ({
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '9px',
                  padding:        collapsed ? '9px' : '8px 10px',
                  borderRadius:   'var(--r-md)',
                  marginBottom:   '1px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color:          isActive ? '#f59e0b' : 'var(--text2)',
                  background:     isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                  fontSize:       '13px',
                  fontWeight:     isActive ? 600 : 400,
                  whiteSpace:     'nowrap',
                  textDecoration: 'none',
                  transition:     'all .15s',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    {!collapsed && label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 6px' }}>

        {/* Foydalanuvchi */}
        {!collapsed && user && (
          <div style={{
            padding:      '8px 10px',
            marginBottom: '4px',
            borderRadius: 'var(--r-lg)',
            background:   'var(--surface2)',
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            animation:    'fadeIn 0.2s var(--ease)',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>
              {AVATARS[user.avatar] || '👤'}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize:     '13px',
                fontWeight:   600,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}>
                {user.username}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span style={{
                  fontSize:      '10px',
                  fontWeight:    600,
                  padding:       '1px 6px',
                  borderRadius:  '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  background:    planStyle.bg,
                  color:         planStyle.color,
                }}>
                  {user.plan}
                </span>
                {user.is_admin && (
                  <span style={{
                    fontSize:      '10px',
                    fontWeight:    600,
                    padding:       '1px 6px',
                    borderRadius:  '100px',
                    background:    'rgba(245,158,11,0.12)',
                    color:         '#f59e0b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}>
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chiqish */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Chiqish' : undefined}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap:            '9px',
            padding:        collapsed ? '9px' : '8px 10px',
            borderRadius:   'var(--r-md)',
            width:          '100%',
            border:         'none',
            color:          'var(--error)',
            background:     'transparent',
            fontSize:       '13px',
            fontFamily:     'inherit',
            whiteSpace:     'nowrap',
            transition:     'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--error-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && 'Chiqish'}
        </button>

        {/* Yig'ish tugmasi */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Kengaytirish' : 'Yig\'ish'}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '7px',
            borderRadius:   'var(--r-md)',
            width:          '100%',
            border:         'none',
            color:          'var(--text3)',
            background:     'transparent',
            marginTop:      '2px',
            transition:     'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  )
}