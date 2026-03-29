// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useLang } from '../i18n/LanguageContext'
import { Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react'

const AVATARS = [
  { key: 'bot',    emoji: '🤖', label: 'Robot' },
  { key: 'cat',    emoji: '🐱', label: 'Mushuk' },
  { key: 'fox',    emoji: '🦊', label: 'Tulki' },
  { key: 'robot',  emoji: '🦾', label: 'Kuchli' },
  { key: 'alien',  emoji: '👽', label: 'Alien' },
  { key: 'wizard', emoji: '🧙', label: 'Sehrgar' },
]

const QUICK_LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Ру' },
  { code: 'en', flag: '🇬🇧', label: 'En' },
]

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: { uz: 'Juda zaif', ru: 'Очень слабый', en: 'Very weak' },     color: '#f87171' }
  if (score <= 2) return { score, label: { uz: 'Zaif',     ru: 'Слабый',      en: 'Weak' },            color: '#fb923c' }
  if (score <= 3) return { score, label: { uz: "O'rta",    ru: 'Средний',     en: 'Medium' },          color: '#facc15' }
  if (score <= 4) return { score, label: { uz: 'Kuchli',   ru: 'Сильный',     en: 'Strong' },          color: '#4ade80' }
  return               { score, label: { uz: 'Juda kuchli',ru: 'Очень сильный',en: 'Very strong' },   color: '#22c55e' }
}

export default function Register() {
  const [form,    setForm]    = useState({ username: '', email: '', password: '', avatar: 'bot' })
  const [showPwd, setShowPwd] = useState(false)
  const [focused, setFocused] = useState('')
  const [loading, setLoading] = useState(false)
  const { t, lang, changeLang } = useLang()
  const navigate              = useNavigate()

  const update   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const strength = getPasswordStrength(form.password)

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password)
      return toast.error(t('required'))
    if (form.password.length < 8)
      return toast.error(t('passwordTooShort'))
    if (!/[0-9]/.test(form.password))
      return toast.error(lang === 'uz' ? 'Parolda kamida 1 ta raqam bo\'lishi kerak' : lang === 'ru' ? 'Пароль должен содержать цифру' : 'Password must contain a number')

    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success('🎉 ' + t('success'))
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (name) => ({
    width: '100%', padding: '12px 14px', background: 'var(--bg)',
    border: `1px solid ${focused === name ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--r-lg)', color: 'var(--text)', fontSize: '14px', outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
    boxShadow: focused === name ? '0 0 0 3px var(--accent-soft)' : 'none',
  })

  const canSubmit = form.username && form.email && form.password.length >= 8 && !loading

  const registerText = { uz: "Ro'yxatdan o'ting", ru: 'Регистрация', en: 'Create account' }
  const hasAccount   = { uz: 'Akkauntingiz bormi?', ru: 'Уже есть аккаунт?', en: 'Already have an account?' }
  const chooseAvatar = { uz: 'Avatar tanlang', ru: 'Выберите аватар', en: 'Choose avatar' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Til tanlash */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '6px' }}>
        {QUICK_LANGS.map(({ code, flag, label }) => (
          <button key={code} onClick={() => changeLang(code)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: 'var(--r-md)', border: `1px solid ${lang === code ? 'var(--accent)' : 'var(--border)'}`, background: lang === code ? 'var(--accent-soft)' : 'var(--surface)', color: lang === code ? '#a78bfa' : 'var(--text3)', fontSize: '12px', fontWeight: lang === code ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .15s' }}>
            <span>{flag}</span><span>{label}</span>
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s var(--ease) both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '18px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            <Sparkles size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {registerText[lang] || registerText.uz}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '6px' }}>Alone AI</p>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-2xl)', padding: '28px', boxShadow: 'var(--shadow-lg)' }}>

          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>{t('username')}</label>
            <input type="text" value={form.username} onChange={e => update('username', e.target.value)} onFocus={() => setFocused('username')} onBlur={() => setFocused('')} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="misol_user" style={inputStyle('username')} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>{t('email')}</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="email@misol.com" style={inputStyle('email')} />
          </div>

          {/* Parol */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '7px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused('')} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••" style={{ ...inputStyle('password'), paddingRight: '44px' }} />
              <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', padding: '4px', display: 'flex', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Parol kuchi */}
            {form.password && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.score ? strength.color : 'var(--surface3)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: strength.color, fontWeight: 500 }}>
                  {strength.score >= 3 && <Check size={11} />}
                  {typeof strength.label === 'object' ? (strength.label[lang] || strength.label.uz) : strength.label}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', display: 'block', marginBottom: '10px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              {chooseAvatar[lang] || chooseAvatar.uz}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {AVATARS.map(({ key, emoji }) => (
                <button key={key} onClick={() => update('avatar', key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 6px', borderRadius: 'var(--r-lg)', border: `2px solid ${form.avatar === key ? 'var(--accent)' : 'var(--border)'}`, background: form.avatar === key ? 'var(--accent-soft)' : 'var(--bg)', cursor: 'pointer', transition: 'all .15s', boxShadow: form.avatar === key ? '0 0 0 2px var(--accent-glow)' : 'none' }}>
                  <span style={{ fontSize: '22px', lineHeight: 1 }}>{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tugma */}
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: '100%', padding: '13px', borderRadius: 'var(--r-lg)', border: 'none', background: !canSubmit ? 'var(--surface3)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: !canSubmit ? 'var(--text3)' : 'white', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all .2s', boxShadow: !canSubmit ? 'none' : '0 4px 16px rgba(124,58,237,0.35)', cursor: !canSubmit ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)' }}>
            {loading
              ? <><span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> {t('loading')}</>
              : <>{registerText[lang] || registerText.uz} <ArrowRight size={16} /></>
            }
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          {hasAccount[lang] || hasAccount.uz}{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600 }}>{t('login')}</Link>
        </p>
      </div>
    </div>
  )
}