// src/components/layout/Layout.jsx  (yangilangan)
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header  from './Header'
import Footer  from './Footer'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'

export default function Layout() {
  const fetchUser    = useAuthStore((s) => s.fetchUser)
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    fetchUser()
    loadSettings()
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </div>
        <Footer />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
        .desktop-sidebar { display: flex; }
      `}</style>
    </div>
  )
}