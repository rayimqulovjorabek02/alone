// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react'

const AVATARS = [
  { key: 'bot',    emoji: '🤖', label: 'Robot' },
  { key: 'cat',    emoji: '🐱', label: 'Mushuk' },
  { key: 'fox',    emoji: '🦊', label: 'Tulki' },
  { key: 'robot',  emoji: '🦾', label: 'Kuchli' },
  { key: 'alien',  emoji: '👽', label: 'Alien' },
  { key: 'wizard', emoji: '🧙', label: 'Sehrgar' },
]

// Parol kuchini hisoblash
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score, label: 'Juda zaif', color: '#f87171' }
  if (score <= 2) return { score, label: 'Zaif',      color: '#fb923c' }
  if (score <= 3) return { score, label: 'O\'rta',    color: '#facc15' }
  if (score <= 4) return { score, label: 'Kuchli',    color: '#4ade80' }
  return               { score, label: 'Juda kuchli', color: '#22c55e' }
}

export default function Register() {
  const [form,     setForm]     = useState({ username: '', email: '', password: '', avatar: 'bot' })
  const [showPwd,  setShowPwd]  = useState(false)
  const [focused,  setFocused]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate                = useNavigate()

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const strength = getPasswordStrength(form.password)

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password)
      return toast.error("Barcha maydonlar to'ldirilishi kerak")
    if (form.username.length < 2)
      return toast.error("Ism kamida 2 ta harf bo'lishi kerak")
    if (form.password.length < 8)
      return toast.error("Parol kamida 8 ta belgi bo'lishi kerak")
    if (!/[0-9]/.test(form.password))
      return toast.error("Parolda kamida 1 ta raqam bo'lishi kerak")

    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success("Ro'yxatdan o'tildi! Xush kelibsiz 🎉")
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.detail || "Xato yuz berdi")
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

  const canSubmit = form.username && form.email && form.password.length >= 8

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
      <div style={{
        position:     'absolute',
        top:          '-10%',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        '600px',
        height:       '600px',
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s var(--ease) both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width:          60,
            height:         60,
            borderRadius:   '18px',
            background:     'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 16px',
            boxShadow:      '0 8px 24px rgba(124,58,237,0.4)',
          }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Ro'yxatdan <span className="text-gradient">o'ting</span>
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '6px' }}>
            Bepul akkaunt yarating
          </p>
        </div>

        {/* Form */}
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)',
          padding:      '28px',
          boxShadow:    'var(--shadow-lg)',
        }}>

          {/* Ism */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => update('username', e.target.value)}
              onFocus={() => setFocused('username')}
              onBlur={() => setFocused('')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="misol_user"
              style={inputStyle('username')}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="email@misol.com"
              style={inputStyle('email')}
            />
          </div>

          {/* Parol */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Parol
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Kamida 8 belgi"
                style={{ ...inputStyle('password'), paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position:  'absolute',
                  right:     '12px',
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border:    'none',
                  color:     'var(--text3)',
                  padding:   '4px',
                  display:   'flex',
                  cursor:    'pointer',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Parol kuchi ko'rsatkichi */}
            {form.password && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      flex:         1,
                      height:       '3px',
                      borderRadius: '2px',
                      background:   i <= strength.score ? strength.color : 'var(--surface3)',
                      transition:   'background 0.3s',
                    }} />
                  ))}
                </div>
                <div style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '5px',
                  fontSize:    '11px',
                  color:       strength.color,
                  fontWeight:  500,
                }}>
                  {strength.score >= 3 && <Check size={11} />}
                  {strength.label}
                </div>
              </div>
            )}
          </div>

          {/* Avatar tanlash */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '10px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Avatar tanlang
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {AVATARS.map(({ key, emoji, label }) => (
                <button
                  key={key}
                  onClick={() => update('avatar', key)}
                  title={label}
                  style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    gap:            '4px',
                    padding:        '10px 6px',
                    borderRadius:   'var(--r-lg)',
                    border:         `2px solid ${form.avatar === key ? 'var(--accent)' : 'var(--border)'}`,
                    background:     form.avatar === key ? 'var(--accent-soft)' : 'var(--bg)',
                    cursor:         'pointer',
                    transition:     'all .15s',
                    boxShadow:      form.avatar === key ? '0 0 0 2px var(--accent-glow)' : 'none',
                  }}
                >
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{emoji}</span>
                  <span style={{
                    fontSize:  '9px',
                    color:     form.avatar === key ? '#a78bfa' : 'var(--text3)',
                    fontWeight: 600,
                  }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ro'yxatdan o'tish tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            style={{
              width:          '100%',
              padding:        '13px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              background:     loading || !canSubmit
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          loading || !canSubmit ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              transition:     'all .2s',
              boxShadow:      loading || !canSubmit ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              cursor:         loading || !canSubmit ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{
                  width:       16,
                  height:      16,
                  border:      '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display:     'inline-block',
                }} />
                Ro'yxatdan o'tilmoqda...
              </>
            ) : (
              <>
                Ro'yxatdan o'tish
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Login linki */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          Akkauntingiz bormi?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600 }}>
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}