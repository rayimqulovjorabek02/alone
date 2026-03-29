// src/pages/ForgotPassword.jsx
import { useState }          from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api                   from '../api/client'
import toast                 from 'react-hot-toast'
import { useLang }           from '../i18n/LanguageContext'
import { ArrowLeft, Mail, Send, Sparkles } from 'lucide-react'

const QUICK_LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Ру' },
  { code: 'en', flag: '🇬🇧', label: 'En' },
]

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [sent,    setSent]    = useState(false)
  const { t, lang, changeLang } = useLang()
  const navigate              = useNavigate()

  const handleSubmit = async () => {
    if (!email) return toast.error(t('required'))
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error(t('invalidEmail'))
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
      toast.success(
        lang === 'uz' ? 'Kod emailga yuborildi' :
        lang === 'ru' ? 'Код отправлен на email' :
                        'Code sent to your email'
      )
      setTimeout(() => navigate('/reset-code', { state: { email } }), 1500)
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    uz: 'Parolni tiklash',
    ru: 'Сброс пароля',
    en: 'Reset password',
  }
  const subtitles = {
    uz: 'Emailingizga tasdiqlash kodi yuboramiz',
    ru: 'Отправим код подтверждения на ваш email',
    en: "We'll send a verification code to your email",
  }
  const btnLabels = {
    uz: 'Kod yuborish',
    ru: 'Отправить код',
    en: 'Send code',
  }

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
        top:          '-20%',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        '500px',
        height:       '500px',
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      {/* Til tanlash */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '6px' }}>
        {QUICK_LANGS.map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => changeLang(code)}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '4px',
              padding:    '6px 10px',
              borderRadius:'var(--r-md)',
              border:     `1px solid ${lang === code ? 'var(--accent)' : 'var(--border)'}`,
              background: lang === code ? 'var(--accent-soft)' : 'var(--surface)',
              color:      lang === code ? '#a78bfa' : 'var(--text3)',
              fontSize:   '12px',
              fontWeight: lang === code ? 700 : 400,
              cursor:     'pointer',
              fontFamily: 'var(--font)',
              transition: 'all .15s',
            }}
          >
            <span>{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div style={{
        width:     '100%',
        maxWidth:  '380px',
        animation: 'fadeIn 0.4s var(--ease) both',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width:          56,
            height:         56,
            borderRadius:   '16px',
            background:     'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 14px',
            boxShadow:      '0 8px 24px rgba(124,58,237,0.4)',
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {titles[lang] || titles.uz}
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
            {subtitles[lang] || subtitles.uz}
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

          {/* Email maydon */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    600,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '7px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}>
              {t('email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{
                position:      'absolute',
                left:          12,
                top:           '50%',
                transform:     'translateY(-50%)',
                color:         'var(--text3)',
                pointerEvents: 'none',
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="email@misol.com"
                disabled={sent}
                style={{
                  width:        '100%',
                  padding:      '12px 14px 12px 36px',
                  background:   'var(--bg)',
                  border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-lg)',
                  color:        'var(--text)',
                  fontSize:     '14px',
                  outline:      'none',
                  boxSizing:    'border-box',
                  transition:   'border-color .2s, box-shadow .2s',
                  boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
                  opacity:      sent ? 0.6 : 1,
                  fontFamily:   'var(--font)',
                }}
              />
            </div>
          </div>

          {/* Yuborish tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email || sent}
            style={{
              width:          '100%',
              padding:        '13px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              cursor:         loading || !email || sent ? 'not-allowed' : 'pointer',
              background:     loading || !email || sent
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          loading || !email || sent ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              fontFamily:     'var(--font)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              transition:     'all .2s',
              boxShadow:      loading || !email || sent
                ? 'none'
                : '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{
                  width:          16,
                  height:         16,
                  border:         '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius:   '50%',
                  display:        'inline-block',
                }} />
                {t('loading')}
              </>
            ) : sent ? (
              <>✓ { lang === 'uz' ? 'Yuborildi' : lang === 'ru' ? 'Отправлено' : 'Sent' }</>
            ) : (
              <>
                <Send size={15} />
                {btnLabels[lang] || btnLabels.uz}
              </>
            )}
          </button>
        </div>

        {/* Orqaga link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/login"
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '5px',
              color:      'var(--text3)',
              fontSize:   '13px',
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            <ArrowLeft size={14} />
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}