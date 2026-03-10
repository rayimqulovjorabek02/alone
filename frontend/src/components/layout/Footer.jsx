// src/components/layout/Footer.jsx
// Mobile uchun pastki navigatsiya
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Image, LayoutDashboard, Settings, Bot } from 'lucide-react'

const NAV = [
  { path: '/chat',      icon: MessageSquare,   label: 'Chat' },
  { path: '/image',     icon: Image,           label: 'Rasm' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Bosh' },
  { path: '/agent',     icon: Bot,             label: 'Agent' },
  { path: '/settings',  icon: Settings,        label: 'Sozlama' },
]

export default function Footer() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <nav style={{
      display:        'none',      // Desktop da yashirish
      borderTop:      '1px solid var(--border)',
      background:     'var(--surface)',
      padding:        '8px 0 env(safe-area-inset-bottom)',
    }}
    className="mobile-footer"
    >
      {NAV.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            '3px',
              padding:        '6px 0',
              border:         'none',
              cursor:         'pointer',
              background:     'transparent',
              color:          active ? 'var(--accent)' : 'var(--text3)',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 400 }}>{label}</span>
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