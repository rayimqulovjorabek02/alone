// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { LanguageProvider } from './i18n/LanguageContext'

import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetCode      from './pages/ResetCode'
import NewPassword    from './pages/NewPassword'

import Chat          from './pages/Chat'
import Dashboard     from './pages/Dashboard'
import ImageGen      from './pages/ImageGen'
import Settings      from './pages/Settings'
import Profile       from './pages/Profile'
import Notifications from './pages/Notifications'
import Premium       from './pages/Premium'
import FileAnalysis  from './pages/FileAnalysis'
import Feedback      from './pages/Feedback'
import Agent         from './pages/Agent'
import Reminder      from './pages/Reminder'
import Todo          from './pages/Todo'
import AdminPanel    from './pages/AdminPanel'
import AdminStats    from './pages/AdminStats'
import DevPanel      from './pages/DevPanel'
import TwoFactor     from './pages/TwoFactor'
import DevPanel      from './pages/DevPanel'

import Layout from './components/layout/Layout'

function PrivateRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  return isAuth ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated())
  return isAuth ? <Navigate to="/chat" replace /> : children
}

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_admin) return <Navigate to="/chat" replace />
  return children
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-code"      element={<PublicRoute><ResetCode /></PublicRoute>} />
          <Route path="/new-password"    element={<PublicRoute><NewPassword /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index              element={<Navigate to="/chat" replace />} />
            <Route path="chat"        element={<Chat />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="image"       element={<ImageGen />} />
            <Route path="agent"       element={<Agent />} />
            <Route path="todo"        element={<Todo />} />
            <Route path="reminder"    element={<Reminder />} />
            <Route path="files"       element={<FileAnalysis />} />
            <Route path="settings"    element={<Settings />} />
            <Route path="profile"     element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="premium"     element={<Premium />} />
            <Route path="feedback"    element={<Feedback />} />
            <Route path="admin"       element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
            <Route path="dev"         element={<AdminRoute><DevPanel /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}