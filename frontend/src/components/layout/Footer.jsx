// src/components/layout/Footer.jsx
// Mobile uchun pastki navigatsiya
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang }                  from '../../i18n/LanguageContext'
import { MessageSquare, Image, LayoutDashboard, Settings, Bot } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()

  const NAV_LABELS = {
    chat:     { uz: 'Chat',    ru: 'Чат',      en: 'Chat'     },
    image:    { uz: 'Rasm',    ru: 'Картинки', en: 'Images'   },
    dashboard:{ uz: 'Bosh',    ru: 'Главная',  en: 'Home'     },
    agent:    { uz: 'Agent',   ru: 'Агент',    en: 'Agent'    },
    settings: { uz: 'Sozlama', ru: 'Настройки',en: 'Settings' },
  }

  const NAV = [
    { path: '/chat',      icon: MessageSquare,   key: 'chat' },
    { path: '/image',     icon: Image,           key: 'image' },
    { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    { path: '/agent',     icon: Bot,             key: 'agent' },
    { path: '/settings',  icon: Settings,        key: 'settings' },
  ]

  return (
    <nav
      style={{
        display:    'none',
        borderTop:  '1px solid var(--border)',
        background: 'var(--surface)',
        padding:    '8px 0 env(safe-area-inset-bottom)',
      }}
      className="mobile-footer"
    >
      {NAV.map(({ path, icon: Icon, key }) => {
        const active = location.pathname === path
        const label  = NAV_LABELS[key]?.[lang] || NAV_LABELS[key]?.uz || key
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '3px',
              padding:       '6px 0',
              border:        'none',
              cursor:        'pointer',
              background:    'transparent',
              color:         active ? 'var(--accent)' : 'var(--text3)',
              fontFamily:    'var(--font)',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}

      <style>{`
        @media (max-width: 768px) {
          .mobile-footer { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}