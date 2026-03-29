// src/pages/NewPassword.jsx
import { useState }                    from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api                             from '../api/client'
import toast                           from 'react-hot-toast'
import { useLang }                     from '../i18n/LanguageContext'
import { Eye, EyeOff, Check, ArrowRight, Sparkles } from 'lucide-react'


// ── Parol kuchini hisoblash ───────────────────────────────────
function getPasswordStrength(pwd, lang) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)           score++
  if (pwd.length >= 12)          score++
  if (/[A-Z]/.test(pwd))         score++
  if (/[0-9]/.test(pwd))         score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  const labels = {
    1: { uz: 'Juda zaif',  ru: 'Очень слабый', en: 'Very weak' },
    2: { uz: 'Zaif',       ru: 'Слабый',       en: 'Weak' },
    3: { uz: "O'rta",      ru: 'Средний',      en: 'Medium' },
    4: { uz: 'Kuchli',     ru: 'Сильный',      en: 'Strong' },
    5: { uz: 'Juda kuchli',ru: 'Очень сильный',en: 'Very strong' },
  }
  const colors = { 1:'#f87171', 2:'#fb923c', 3:'#facc15', 4:'#4ade80', 5:'#22c55e' }
  const key    = Math.min(score, 5) || 1

  return {
    score,
    label: (labels[key] || labels[1])[lang] || labels[1].uz,
    color: colors[key] || colors[1],
  }
}


export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [showCnf,  setShowCnf]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [focusPwd, setFocusPwd] = useState(false)
  const [focusCnf, setFocusCnf] = useState(false)
  const navigate                = useNavigate()
  const { state }               = useLocation()
  const email                   = state?.email || ''
  const code                    = state?.code  || ''
  const { t, lang }             = useLang()

  const strength = getPasswordStrength(password, lang)

  const handleSubmit = async () => {
    if (password.length < 8)      return toast.error(t('passwordTooShort'))
    if (!/[0-9]/.test(password))  return toast.error(t('passwordNeedsNumber'))
    if (password !== confirm)     return toast.error(t('passwordMismatch'))
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { email, code, password })
      toast.success(
        lang === 'uz' ? "Parol o'zgartirildi!" :
        lang === 'ru' ? 'Пароль изменён!' :
                        'Password changed!'
      )
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (focused) => ({
    width:        '100%',
    padding:      '12px 44px 12px 14px',
    background:   'var(--bg)',
    border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 'var(--r-lg)',
    color:        'var(--text)',
    fontSize:     '14px',
    outline:      'none',
    boxSizing:    'border-box',
    transition:   'border-color .2s, box-shadow .2s',
    boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
    fontFamily:   'var(--font)',
  })

  const canSubmit = password.length >= 8 && confirm.length >= 8 && !loading

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
            { lang === 'uz' ? 'Yangi parol' : lang === 'ru' ? 'Новый пароль' : 'New password' }
          </h2>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
            { lang === 'uz' ? 'Kuchli parol kiriting' : lang === 'ru' ? 'Введите надёжный пароль' : 'Enter a strong password' }
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

          {/* Yangi parol */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    600,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '7px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}>
              {t('newPassword')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusPwd(true)}
                onBlur={() => setFocusPwd(false)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={inputStyle(focusPwd)}
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position:  'absolute',
                  right:     '12px',
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  background:'none',
                  border:    'none',
                  cursor:    'pointer',
                  color:     'var(--text3)',
                  display:   'flex',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Parol kuchi */}
            {password && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      style={{
                        flex:         1,
                        height:       '3px',
                        borderRadius: '2px',
                        background:   i <= strength.score ? strength.color : 'var(--surface3)',
                        transition:   'background 0.3s',
                      }}
                    />
                  ))}
                </div>
                <div style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '4px',
                  fontSize:   '11px',
                  color:      strength.color,
                  fontWeight: 500,
                }}>
                  {strength.score >= 3 && <Check size={11} />}
                  {strength.label}
                </div>
              </div>
            )}
          </div>

          {/* Parolni tasdiqlash */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    600,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '7px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}>
              {t('confirmPassword')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCnf ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocusCnf(true)}
                onBlur={() => setFocusCnf(false)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                style={{
                  ...inputStyle(focusCnf),
                  borderColor: confirm && password !== confirm
                    ? 'var(--error)'
                    : confirm && password === confirm
                    ? 'var(--success)'
                    : focusCnf ? 'var(--accent)' : 'var(--border)',
                }}
              />
              <button
                onClick={() => setShowCnf(!showCnf)}
                style={{
                  position:  'absolute',
                  right:     '12px',
                  top:       '50%',
                  transform: 'translateY(-50%)',
                  background:'none',
                  border:    'none',
                  cursor:    'pointer',
                  color:     'var(--text3)',
                  display:   'flex',
                }}
              >
                {showCnf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Mos / mos emas */}
            {confirm && (
              <div style={{
                fontSize:   '11px',
                marginTop:  '6px',
                color:      password === confirm ? 'var(--success)' : 'var(--error)',
                display:    'flex',
                alignItems: 'center',
                gap:        '4px',
              }}>
                {password === confirm
                  ? <><Check size={11} /> { lang === 'uz' ? 'Parollar mos' : lang === 'ru' ? 'Пароли совпадают' : 'Passwords match' }</>
                  : `⚠ ${t('passwordMismatch')}`
                }
              </div>
            )}
          </div>

          {/* Saqlash tugmasi */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width:          '100%',
              padding:        '13px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              cursor:         !canSubmit ? 'not-allowed' : 'pointer',
              background:     !canSubmit
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          !canSubmit ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              fontFamily:     'var(--font)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              transition:     'all .2s',
              boxShadow:      !canSubmit ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
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
              <>
                <ArrowRight size={16} />
                { lang === 'uz' ? 'Saqlash' : lang === 'ru' ? 'Сохранить' : 'Save' }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}