// src/components/layout/Sidebar.jsx
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLang } from '../../i18n/LanguageContext'
import {
  MessageSquare, Image, Settings, Bell, Crown,
  User, LogOut, Shield, FileText, ThumbsUp,
  LayoutDashboard, ChevronLeft, ChevronRight,
  Bot, CheckSquare, AlarmClock, Zap,
} from 'lucide-react'

// ── Avatar emoji lug'ati ──────────────────────────────────────
const AVATAR_EMOJIS = {
  bot:    '🤖',
  cat:    '🐱',
  fox:    '🦊',
  robot:  '🦾',
  alien:  '👽',
  wizard: '🧙',
}

// ── Plan rang stili ───────────────────────────────────────────
const PLAN_COLORS = {
  free:    { bg: 'rgba(255,255,255,0.06)', color: 'var(--text3)' },
  pro:     { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa' },
  premium: { bg: 'rgba(245,158,11,0.15)',  color: '#fcd34d' },
}

// ── Bo'lim nomlari (tarjima) ──────────────────────────────────
const SECTION_LABELS = {
  main:  { uz: 'Asosiy',    ru: 'Основное',    en: 'Main' },
  tools: { uz: 'Vositalar', ru: 'Инструменты', en: 'Tools' },
  other: { uz: 'Boshqa',    ru: 'Прочее',      en: 'Other' },
}


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const { t, lang }               = useLang()
  const navigate                  = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const planStyle = PLAN_COLORS[user?.plan] || PLAN_COLORS.free

  // ── Navigatsiya elementlari (tarjima bilan) ───────────────────
  const NAV_ITEMS = [
    { path: '/chat',          icon: MessageSquare,   label: t('chat'),          section: 'main' },
    { path: '/agent',         icon: Zap,             label: t('agent'),         section: 'main' },
    { path: '/image',         icon: Image,           label: t('image'),         section: 'main' },
    { path: '/dashboard',     icon: LayoutDashboard, label: t('dashboard'),     section: 'tools' },
    { path: '/files',         icon: FileText,        label: t('files'),         section: 'tools' },
    { path: '/todo',          icon: CheckSquare,     label: t('todo'),          section: 'tools' },
    { path: '/reminder',      icon: AlarmClock,      label: t('reminders'),     section: 'tools' },
    { path: '/notifications', icon: Bell,            label: t('notifications'), section: 'other' },
    { path: '/premium',       icon: Crown,           label: t('premium'),       section: 'other' },
    { path: '/feedback',      icon: ThumbsUp,        label: t('feedback'),      section: 'other' },
    { path: '/settings',      icon: Settings,        label: t('settings'),      section: 'other' },
    { path: '/profile',       icon: User,            label: t('profile'),       section: 'other' },
  ]

  // ── Admin elementlari ─────────────────────────────────────────
  const ADMIN_ITEMS = [
    { path: '/admin',       icon: Shield,          label: t('admin') },
    { path: '/admin/stats', icon: LayoutDashboard, label: t('statistics') },
  ]

  // ── Nav elementi stili ────────────────────────────────────────
  const navLinkStyle = (isActive) => ({
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
  })

  // ── Admin nav elementi stili ──────────────────────────────────
  const adminNavLinkStyle = (isActive) => ({
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
  })

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

      {/* ── Logo ──────────────────────────────────────────────── */}
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

      {/* ── Navigatsiya ───────────────────────────────────────── */}
      <nav style={{
        flex:       1,
        padding:    '8px 6px',
        overflowY:  'auto',
        overflowX:  'hidden',
      }}>

        {/* Asosiy bo'lim */}
        {!collapsed && (
          <div style={{
            fontSize:      '10px',
            fontWeight:    700,
            color:         'var(--text3)',
            padding:       '8px 8px 4px',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
          }}>
            {SECTION_LABELS.main[lang] || SECTION_LABELS.main.uz}
          </div>
        )}
        {NAV_ITEMS.filter(i => i.section === 'main').map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}

        {/* Vositalar bo'lim */}
        {collapsed
          ? <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
          : (
            <div style={{
              fontSize:      '10px',
              fontWeight:    700,
              color:         'var(--text3)',
              padding:       '8px 8px 4px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}>
              {SECTION_LABELS.tools[lang] || SECTION_LABELS.tools.uz}
            </div>
          )
        }
        {NAV_ITEMS.filter(i => i.section === 'tools').map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}

        {/* Boshqa bo'lim */}
        {collapsed
          ? <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
          : (
            <div style={{
              fontSize:      '10px',
              fontWeight:    700,
              color:         'var(--text3)',
              padding:       '8px 8px 4px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}>
              {SECTION_LABELS.other[lang] || SECTION_LABELS.other.uz}
            </div>
          )
        }
        {NAV_ITEMS.filter(i => i.section === 'other').map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {!collapsed && label}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Admin bo'limi ──────────────────────────────────── */}
        {user?.is_admin && (
          <>
            <div style={{
              height:     1,
              background: 'var(--border)',
              margin:     '8px 4px',
            }} />

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
                style={({ isActive }) => adminNavLinkStyle(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                    {!collapsed && label}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 6px' }}>

        {/* Foydalanuvchi ma'lumoti */}
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
            <div style={{
              width:          36,
              height:         36,
              borderRadius:   '10px',
              background:     'rgba(124,58,237,.2)',
              border:         '1px solid rgba(124,58,237,.3)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '20px',
              flexShrink:     0,
              overflow:       'hidden',
            }}>
              {user.avatar?.startsWith('data:image')
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (AVATAR_EMOJIS[user.avatar] || '👤')
              }
            </div>
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
                  {t(user.plan) || user.plan}
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
                  }}>
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chiqish tugmasi */}
        <button
          onClick={handleLogout}
          title={collapsed ? t('logout') : undefined}
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
            fontFamily:     'var(--font)',
            whiteSpace:     'nowrap',
            transition:     'background .15s',
            cursor:         'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--error-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && t('logout')}
        </button>

        {/* Yig'ish / kengaytirish tugmasi */}
        <button
          onClick={() => setCollapsed(!collapsed)}
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
            cursor:         'pointer',
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