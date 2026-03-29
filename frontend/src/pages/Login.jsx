// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLang } from '../i18n/LanguageContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'

const QUICK_LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Ру' },
  { code: 'en', flag: '🇬🇧', label: 'En' },
]

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [focused,  setFocused]  = useState('')
  const { login }               = useAuthStore()
  const { t, lang, changeLang } = useLang()
  const navigate                = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password) return toast.error(t('required'))
    setLoading(true)
    try {
      await login(email, password)
      toast.success('👋 ' + t('success'))
      navigate('/chat')
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width:        '100%',
    padding:      '12px 14px',
    background:   'var(--bg)',
    border:       `1px solid ${focused === name ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--r-lg)',
    color:        'var(--text)',
    fontSize:     '14px',
    outline:      'none',
    transition:   'border-color .2s, box-shadow .2s',
    boxShadow:    focused === name ? '0 0 0 3px var(--accent-soft)' : 'none',
  })

  const canSend = email && password && !loading

  return (
    <div style={{
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     'var(--bg)',
      padding:        '20px',
      position:       'relative',
      overflow:       'hidden',
    }}>
      {/* Fon effekti */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Til tanlash — yuqori o'ng burchak */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '6px' }}>
        {QUICK_LANGS.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => changeLang(code)}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         '4px',
              padding:     '6px 10px',
              borderRadius:'var(--r-md)',
              border:      `1px solid ${lang === code ? 'var(--accent)' : 'var(--border)'}`,
              background:  lang === code ? 'var(--accent-soft)' : 'var(--surface)',
              color:       lang === code ? '#a78bfa' : 'var(--text3)',
              fontSize:    '12px',
              fontWeight:  lang === code ? 700 : 400,
              cursor:      'pointer',
              fontFamily:  'var(--font)',
              transition:  'all .15s',
            }}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s var(--ease) both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '18px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Alone <span className="text-gradient">AI</span>
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '6px' }}>
            {t('login')}
          </p>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="email@misol.com"
              style={inputStyle('email')}
            />
          </div>

          {/* Parol */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                {t('password')}
              </label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#a78bfa' }}>
                {t('forgotPassword')}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={{ ...inputStyle('password'), paddingRight: '44px' }}
              />
              <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', padding: '4px', display: 'flex', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Kirish tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            style={{
              width: '100%', padding: '13px', borderRadius: 'var(--r-lg)', border: 'none',
              background:  !canSend ? 'var(--surface3)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:       !canSend ? 'var(--text3)' : 'white',
              fontSize:    '14px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all .2s',
              boxShadow:  !canSend ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              cursor:     !canSend ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            {loading ? (
              <><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> {t('loading')}</>
            ) : (
              <>{t('login')} <ArrowRight size={16} /></>
            )}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          {lang === 'uz' && "Akkauntingiz yo'qmi?"}{lang === 'ru' && 'Нет аккаунта?'}{lang === 'en' && "Don't have an account?"}{' '}
          <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600 }}>{t('register')}</Link>
        </p>
      </div>
    </div>
  )
}