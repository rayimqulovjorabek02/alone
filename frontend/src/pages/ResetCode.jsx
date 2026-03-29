// src/pages/ResetCode.jsx
import { useState }                    from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api                             from '../api/client'
import toast                           from 'react-hot-toast'
import { useLang }                     from '../i18n/LanguageContext'
import { ArrowLeft, Sparkles } from 'lucide-react'

const QUICK_LANGS = [
  { code: 'uz', flag: '🇺🇿', label: "O'z" },
  { code: 'ru', flag: '🇷🇺', label: 'Ру' },
  { code: 'en', flag: '🇬🇧', label: 'En' },
]

export default function ResetCode() {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const { state }             = useLocation()
  const email                 = state?.email || ''
  const { t, lang, changeLang } = useLang()

  const handleSubmit = async () => {
    if (code.length < 6) return toast.error(t('required'))
    setLoading(true)
    try {
      await api.post('/api/auth/verify-reset-code', { email, code })
      toast.success(
        lang === 'uz' ? 'Kod tasdiqlandi' :
        lang === 'ru' ? 'Код подтверждён' :
                        'Code verified'
      )
      navigate('/new-password', { state: { email, code } })
    } catch (e) {
      toast.error(
        e.response?.data?.detail ||
        (lang === 'uz' ? "Noto'g'ri kod" : lang === 'ru' ? 'Неверный код' : 'Invalid code')
      )
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    uz: 'Kodni kiriting',
    ru: 'Введите код',
    en: 'Enter the code',
  }

  const subtitles = {
    uz: `📧 ${email} ga yuborilgan 6 xonali kod`,
    ru: `📧 6-значный код отправлен на ${email}`,
    en: `📧 6-digit code sent to ${email}`,
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
        {QUICK_LANGS.map(({ code: c, flag, label }) => (
          <button
            key={c}
            onClick={() => changeLang(c)}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '4px',
              padding:    '6px 10px',
              borderRadius:'var(--r-md)',
              border:     `1px solid ${lang === c ? 'var(--accent)' : 'var(--border)'}`,
              background: lang === c ? 'var(--accent-soft)' : 'var(--surface)',
              color:      lang === c ? '#a78bfa' : 'var(--text3)',
              fontSize:   '12px',
              fontWeight: lang === c ? 700 : 400,
              cursor:     'pointer',
              fontFamily: 'var(--font)',
              transition: 'all .15s',
            }}
          >
            <span>{flag}</span><span>{label}</span>
          </button>
        ))}
      </div>

      <div style={{
        width:     '100%',
        maxWidth:  '360px',
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

          {/* OTP input — 6 ta katak */}
          <div style={{
            display:        'flex',
            gap:            '8px',
            justifyContent: 'center',
            marginBottom:   '24px',
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="tel"
                maxLength={1}
                value={code[i] || ''}
                onChange={e => {
                  const val = e.target.value.replace(/\D/, '')
                  const arr = code.split('')
                  arr[i]    = val
                  setCode(arr.join('').slice(0, 6))
                  if (val && i < 5) {
                    document.getElementById(`otp-${i + 1}`)?.focus()
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !code[i] && i > 0) {
                    document.getElementById(`otp-${i - 1}`)?.focus()
                  }
                  if (e.key === 'Enter' && code.length === 6) handleSubmit()
                }}
                onPaste={e => {
                  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                  setCode(pasted)
                  e.preventDefault()
                }}
                style={{
                  width:        '44px',
                  height:       '52px',
                  textAlign:    'center',
                  fontSize:     '22px',
                  fontWeight:   700,
                  background:   'var(--bg)',
                  border:       `2px solid ${code[i] ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-md)',
                  color:        'var(--text)',
                  outline:      'none',
                  transition:   'border-color .15s, box-shadow .15s',
                  boxShadow:    code[i] ? '0 0 0 2px var(--accent-soft)' : 'none',
                  fontFamily:   'var(--font-mono)',
                }}
              />
            ))}
          </div>

          {/* Tasdiqlash tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={loading || code.length < 6}
            style={{
              width:          '100%',
              padding:        '13px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              cursor:         loading || code.length < 6 ? 'not-allowed' : 'pointer',
              background:     loading || code.length < 6
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          loading || code.length < 6 ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              fontFamily:     'var(--font)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              transition:     'all .2s',
              boxShadow:      loading || code.length < 6
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
            ) : (
              lang === 'uz' ? 'Tasdiqlash' :
              lang === 'ru' ? 'Подтвердить' :
                              'Verify'
            )}
          </button>
        </div>

        {/* Orqaga */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link
            to="/forgot-password"
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