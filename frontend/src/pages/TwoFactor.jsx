// src/pages/TwoFactor.jsx
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useLang }             from '../i18n/LanguageContext'
import { Shield, Smartphone, CheckCircle, AlertTriangle, Copy, Eye, EyeOff } from 'lucide-react'


export default function TwoFactor() {
  const [step,         setStep]         = useState(0)
  const [qrCode,       setQrCode]       = useState('')
  const [secret,       setSecret]       = useState('')
  const [code,         setCode]         = useState('')
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [showSecret,   setShowSecret]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const { t, lang }                     = useLang()
  const navigate                        = useNavigate()

  useEffect(() => { load2faStatus() }, [])

  const load2faStatus = async () => {
    try {
      const { data } = await api.get('/api/profile/2fa/status')
      setIs2faEnabled(data.enabled)
    } catch {}
  }

  const startSetup = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/profile/2fa/setup')
      setQrCode(data.qr_code)
      setSecret(data.secret)
      setStep(1)
    } catch {
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) return toast.error(
      lang === 'uz' ? '6 raqamli kod kiriting' :
      lang === 'ru' ? 'Введите 6-значный код' :
                      'Enter a 6-digit code'
    )
    setLoading(true)
    try {
      await api.post('/api/profile/2fa/enable', { code })
      setIs2faEnabled(true)
      setStep(3)
      toast.success(
        lang === 'uz' ? '2FA yoqildi!' :
        lang === 'ru' ? '2FA включён!' :
                        '2FA enabled!'
      )
    } catch {
      toast.error(
        lang === 'uz' ? "Kod noto'g'ri. Qayta urinib ko'ring." :
        lang === 'ru' ? 'Неверный код. Попробуйте снова.' :
                        'Invalid code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const disable2fa = async () => {
    if (!confirm(
      lang === 'uz' ? "2FA ni o'chirmoqchimisiz?" :
      lang === 'ru' ? 'Отключить 2FA?' :
                      'Disable 2FA?'
    )) return
    try {
      await api.post('/api/profile/2fa/disable')
      setIs2faEnabled(false)
      setStep(0)
      toast.success(
        lang === 'uz' ? "2FA o'chirildi" :
        lang === 'ru' ? '2FA отключён' :
                        '2FA disabled'
      )
    } catch {
      toast.error(t('error'))
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast.success(t('copied'))
  }

  // ── Bosqich nomlari ────────────────────────────────────────
  const STEPS = {
    uz: ['Boshlash', 'QR Kod', 'Tasdiqlash', 'Tayyor'],
    ru: ['Начало',   'QR Код',  'Проверка',   'Готово'],
    en: ['Start',    'QR Code', 'Verify',     'Done'],
  }
  const steps = STEPS[lang] || STEPS.uz

  const cardStyle = {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: 'var(--r-xl)',
    padding:      '28px',
    maxWidth:     '480px',
    margin:       '0 auto',
  }

  const btnStyle = (primary = true) => ({
    padding:      '11px 24px',
    borderRadius: 'var(--r-lg)',
    border:       'none',
    cursor:       loading ? 'not-allowed' : 'pointer',
    fontWeight:   700,
    fontSize:     '14px',
    fontFamily:   'var(--font)',
    opacity:      loading ? 0.6 : 1,
    background:   primary ? 'var(--accent)' : 'var(--surface2)',
    color:        primary ? 'white' : 'var(--text)',
    transition:   'all .15s',
    boxShadow:    primary ? '0 2px 8px var(--accent-glow)' : 'none',
  })

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%' }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '28px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{
          width:          56,
          height:         56,
          borderRadius:   '16px',
          background:     'linear-gradient(135deg, #7c3aed, #6d28d9)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 12px',
          boxShadow:      '0 8px 24px rgba(124,58,237,0.35)',
        }}>
          <Shield size={26} color="white" />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.3px' }}>
          { lang === 'uz' ? 'Ikki bosqichli autentifikatsiya' :
            lang === 'ru' ? 'Двухфакторная аутентификация' :
                            'Two-Factor Authentication' }
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          { lang === 'uz' ? 'Hisobingizni yanada xavfsiz qiling' :
            lang === 'ru' ? 'Сделайте аккаунт ещё безопаснее' :
                            'Make your account more secure' }
        </p>
      </div>

      {/* ── Holat kartasi ─────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '20px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width:          40,
              height:         40,
              borderRadius:   'var(--r-md)',
              background:     is2faEnabled ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              {is2faEnabled
                ? <CheckCircle size={20} color="#22c55e" />
                : <AlertTriangle size={20} color="#f87171" />
              }
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                2FA{' '}
                { is2faEnabled
                  ? (lang === 'uz' ? 'Yoqilgan' : lang === 'ru' ? 'Включён' : 'Enabled')
                  : (lang === 'uz' ? "O'chirilgan" : lang === 'ru' ? 'Отключён' : 'Disabled')
                }
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                { is2faEnabled
                  ? (lang === 'uz' ? 'Hisobingiz himoyalangan' : lang === 'ru' ? 'Аккаунт защищён' : 'Account is protected')
                  : (lang === 'uz' ? "Hisob xavf ostida bo'lishi mumkin" : lang === 'ru' ? 'Аккаунт может быть под угрозой' : 'Account may be at risk')
                }
              </div>
            </div>
          </div>
          {is2faEnabled && (
            <button
              onClick={disable2fa}
              style={{
                padding:      '7px 14px',
                borderRadius: 'var(--r-md)',
                border:       '1px solid rgba(248,113,113,0.3)',
                cursor:       'pointer',
                background:   'rgba(248,113,113,0.1)',
                color:        '#f87171',
                fontSize:     '12px',
                fontWeight:   600,
                fontFamily:   'var(--font)',
                transition:   'all .15s',
              }}
            >
              { lang === 'uz' ? "O'chirish" : lang === 'ru' ? 'Отключить' : 'Disable' }
            </button>
          )}
        </div>
      </div>

      {/* ── 2FA sozlash (yoqilmagan holda) ───────────────────── */}
      {!is2faEnabled && (
        <div style={{ ...cardStyle, animation: 'fadeIn 0.4s var(--ease) 100ms both' }}>

          {/* Bosqich ko'rsatkichi */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}
              >
                <div style={{
                  width:          28,
                  height:         28,
                  borderRadius:   '50%',
                  background:     i <= step ? 'var(--accent)' : 'var(--surface2)',
                  color:          i <= step ? 'white' : 'var(--text3)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '12px',
                  fontWeight:     700,
                  flexShrink:     0,
                  transition:     'background .3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex:       1,
                    height:     2,
                    margin:     '0 6px',
                    background: i < step ? 'var(--accent)' : 'var(--border)',
                    transition: 'background .3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* ── BOSQICH 0 — Kirish ──────────────────────────── */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <Smartphone size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                { lang === 'uz' ? 'Google Authenticator bilan himoyalang' :
                  lang === 'ru' ? 'Защитите с Google Authenticator' :
                                  'Protect with Google Authenticator' }
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '24px' }}>
                { lang === 'uz' ? "Telefondagi Google Authenticator ilovasini o'rnating. Har kirganingizda 6 raqamli kod so'raladi." :
                  lang === 'ru' ? 'Установите Google Authenticator на телефон. При каждом входе будет запрашиваться 6-значный код.' :
                                  'Install Google Authenticator on your phone. A 6-digit code will be required on every login.' }
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'App Store',    href: 'https://apps.apple.com/app/google-authenticator/id388497605' },
                  { label: 'Google Play',  href: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding:      '8px 18px',
                      borderRadius: 'var(--r-lg)',
                      border:       '1px solid var(--border)',
                      color:        'var(--text)',
                      fontSize:     '13px',
                      textDecoration:'none',
                      fontWeight:   600,
                      transition:   'border-color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {label}
                  </a>
                ))}
              </div>
              <button onClick={startSetup} disabled={loading} style={btnStyle()}>
                {loading ? t('loading') : (
                  lang === 'uz' ? 'Sozlashni boshlash →' :
                  lang === 'ru' ? 'Начать настройку →' :
                                  'Start setup →'
                )}
              </button>
            </div>
          )}

          {/* ── BOSQICH 1 — QR Kod ──────────────────────────── */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
                { lang === 'uz' ? 'QR kodni skanerlang' :
                  lang === 'ru' ? 'Отсканируйте QR-код' :
                                  'Scan the QR code' }
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
                { lang === 'uz' ? 'Google Authenticator ilovasini oching va "+" tugmasini bosib QR kodni skanerlang' :
                  lang === 'ru' ? 'Откройте Google Authenticator, нажмите "+" и отсканируйте QR-код' :
                                  'Open Google Authenticator, tap "+" and scan the QR code' }
              </p>

              {/* QR kod rasmi */}
              {qrCode && (
                <div style={{
                  display:      'inline-block',
                  padding:      '12px',
                  background:   'white',
                  borderRadius: 'var(--r-lg)',
                  marginBottom: '20px',
                  boxShadow:    'var(--shadow-md)',
                }}>
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR kod"
                    style={{ width: 180, height: 180, display: 'block' }}
                  />
                </div>
              )}

              {/* Secret key */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '8px' }}>
                  { lang === 'uz' ? "Yoki kodni qo'lda kiriting:" :
                    lang === 'ru' ? 'Или введите код вручную:' :
                                    'Or enter the code manually:' }
                </p>
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  gap:            '8px',
                  background:     'var(--surface2)',
                  borderRadius:   'var(--r-lg)',
                  padding:        '10px 14px',
                  justifyContent: 'space-between',
                }}>
                  <code style={{
                    fontSize:    '13px',
                    fontFamily:  'var(--font-mono)',
                    letterSpacing:'2px',
                    color:       'var(--accent)',
                    filter:      showSecret ? 'none' : 'blur(4px)',
                    userSelect:  showSecret ? 'text' : 'none',
                    transition:  'filter .2s',
                  }}>
                    {secret}
                  </code>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'4px', display:'flex' }}
                    >
                      {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={copySecret}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'4px', display:'flex' }}
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} style={btnStyle()}>
                { lang === 'uz' ? 'Skaneladim →' :
                  lang === 'ru' ? 'Отсканировал →' :
                                  'Scanned →' }
              </button>
            </div>
          )}

          {/* ── BOSQICH 2 — Tasdiqlash ───────────────────────── */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
                { lang === 'uz' ? 'Kodni tasdiqlang' :
                  lang === 'ru' ? 'Подтвердите код' :
                                  'Verify the code' }
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px' }}>
                { lang === 'uz' ? "Google Authenticator da ko'rsatilgan 6 raqamli kodni kiriting" :
                  lang === 'ru' ? 'Введите 6-значный код из Google Authenticator' :
                                  'Enter the 6-digit code from Google Authenticator' }
              </p>

              {/* OTP Inputlar */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    id={`totp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={code[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, '')
                      const arr = code.split('')
                      arr[i]    = val
                      setCode(arr.join(''))
                      if (val && i < 5) {
                        document.getElementById(`totp-${i + 1}`)?.focus()
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !code[i] && i > 0) {
                        document.getElementById(`totp-${i - 1}`)?.focus()
                      }
                    }}
                    style={{
                      width:        '44px',
                      height:       '52px',
                      textAlign:    'center',
                      fontSize:     '20px',
                      fontWeight:   700,
                      background:   'var(--bg)',
                      border:       `2px solid ${code[i] ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)',
                      color:        'var(--text)',
                      outline:      'none',
                      transition:   'border-color .15s',
                      fontFamily:   'var(--font-mono)',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setStep(1)} style={btnStyle(false)}>
                  ← { t('back') }
                </button>
                <button
                  onClick={verifyCode}
                  disabled={loading || code.length < 6}
                  style={{ ...btnStyle(), opacity: loading || code.length < 6 ? 0.6 : 1 }}
                >
                  {loading ? t('loading') : (
                    lang === 'uz' ? 'Tasdiqlash ✓' :
                    lang === 'ru' ? 'Подтвердить ✓' :
                                    'Verify ✓'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── BOSQICH 3 — Tayyor ───────────────────────────── */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width:          72,
                height:         72,
                borderRadius:   '50%',
                background:     'rgba(34,197,94,0.1)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                margin:         '0 auto 20px',
                animation:      'fadeIn 0.5s var(--ease)',
              }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>
                { lang === 'uz' ? '2FA muvaffaqiyatli yoqildi! 🎉' :
                  lang === 'ru' ? '2FA успешно включён! 🎉' :
                                  '2FA successfully enabled! 🎉' }
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.7 }}>
                { lang === 'uz' ? "Endi har kirganingizda Google Authenticator dan 6 raqamli kod so'raladi. Telefoningizni yo'qotmang!" :
                  lang === 'ru' ? 'Теперь при каждом входе будет запрашиваться код из Google Authenticator. Не теряйте телефон!' :
                                  'From now on, a code from Google Authenticator will be required on every login. Do not lose your phone!' }
              </p>
              <button onClick={() => navigate('/settings')} style={btnStyle()}>
                { lang === 'uz' ? 'Sozlamalarga qaytish' :
                  lang === 'ru' ? 'Вернуться в настройки' :
                                  'Back to settings' }
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 2FA yoqilgan — ma'lumot ───────────────────────────── */}
      {is2faEnabled && (
        <div style={{ ...cardStyle, marginTop: '16px', animation: 'fadeIn 0.4s var(--ease) 100ms both' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
            { lang === 'uz' ? '2FA haqida' : lang === 'ru' ? 'О двухфакторной аутентификации' : 'About 2FA' }
          </h3>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {(
              lang === 'uz' ? [
                'Har kirganingizda 6 raqamli kod talab qilinadi',
                "Google Authenticator ilovasini o'chirmang",
                "Telefon almashtirish oldidan 2FA ni o'chiring",
                'Kod 30 soniyada yangilanadi',
              ] :
              lang === 'ru' ? [
                'При каждом входе требуется 6-значный код',
                'Не удаляйте приложение Google Authenticator',
                'Перед сменой телефона отключите 2FA',
                'Код обновляется каждые 30 секунд',
              ] : [
                'A 6-digit code is required on every login',
                'Do not delete the Google Authenticator app',
                'Disable 2FA before changing your phone',
                'Code refreshes every 30 seconds',
              ]
            ).map((item, i) => (
              <li
                key={i}
                style={{
                  display:      'flex',
                  alignItems:   'flex-start',
                  gap:          '8px',
                  fontSize:     '13px',
                  color:        'var(--text2)',
                  lineHeight:   1.6,
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}