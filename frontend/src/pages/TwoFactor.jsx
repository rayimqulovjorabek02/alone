// src/pages/TwoFactor.jsx — 2FA sozlash sahifasi
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { Shield, Smartphone, CheckCircle, AlertTriangle, Copy, Eye, EyeOff } from 'lucide-react'

const STEPS = ['Boshlash', 'QR Kod', 'Tasdiqlash', 'Tayyor']

export default function TwoFactor() {
  const [step,         setStep]         = useState(0)
  const [qrCode,       setQrCode]       = useState('')
  const [secret,       setSecret]       = useState('')
  const [code,         setCode]         = useState('')
  const [is2faEnabled, setIs2faEnabled] = useState(false)
  const [showSecret,   setShowSecret]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const navigate = useNavigate()

  useEffect(() => { load2faStatus() }, [])

  const load2faStatus = async () => {
    try {
      const { data } = await api.get('/api/profile/2fa/status')
      setIs2faEnabled(data.enabled)
    } catch {/* */}
  }

  const startSetup = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/profile/2fa/setup')
      setQrCode(data.qr_code)
      setSecret(data.secret)
      setStep(1)
    } catch {
      toast.error("2FA sozlashda xato")
    } finally { setLoading(false) }
  }

  const verifyCode = async () => {
    if (code.length !== 6) return toast.error("6 raqamli kod kiriting")
    setLoading(true)
    try {
      await api.post('/api/profile/2fa/enable', { code })
      setIs2faEnabled(true)
      setStep(3)
      toast.success("2FA yoqildi!")
    } catch {
      toast.error("Kod noto'g'ri. Qayta urinib ko'ring.")
    } finally { setLoading(false) }
  }

  const disable2fa = async () => {
    if (!confirm("2FA ni o'chirmoqchimisiz?")) return
    try {
      await api.post('/api/profile/2fa/disable')
      setIs2faEnabled(false)
      setStep(0)
      toast.success("2FA o'chirildi")
    } catch { toast.error("Xato") }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    toast.success("Nusxa olindi!")
  }

  // ── Umumiy stil ───────────────────────────────────────────
  const card = {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: '20px',
    padding:      '32px',
    maxWidth:     '460px',
    margin:       '0 auto',
  }

  const btn = (primary = true) => ({
    padding:      '12px 28px',
    borderRadius: '12px',
    border:       'none',
    cursor:       loading ? 'not-allowed' : 'pointer',
    fontWeight:   700,
    fontSize:     '14px',
    fontFamily:   'inherit',
    opacity:      loading ? 0.6 : 1,
    background:   primary ? 'var(--accent)' : 'var(--surface2)',
    color:        primary ? 'white' : 'var(--text)',
    transition:   'all .15s',
  })

  return (
    <div style={{ padding: '32px 24px', overflowY: 'auto', maxHeight: '100%' }}>

      {/* Sarlavha */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '16px',
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Shield size={26} color="white" />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>
          Ikki bosqichli autentifikatsiya
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
          Hisobingizni yanada xavfsiz qiling
        </p>
      </div>

      {/* Holat */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: is2faEnabled ? 'rgba(34,197,94,.1)' : 'rgba(248,113,113,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {is2faEnabled
                ? <CheckCircle size={20} color="#22c55e" />
                : <AlertTriangle size={20} color="#f87171" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                2FA {is2faEnabled ? "Yoqilgan" : "O'chirilgan"}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                {is2faEnabled
                  ? "Hisobingiz himoyalangan"
                  : "Hisob xavf ostida bo'lishi mumkin"}
              </div>
            </div>
          </div>
          {is2faEnabled && (
            <button onClick={disable2fa} style={{
              padding: '7px 14px', borderRadius: '9px', border: 'none',
              cursor: 'pointer', background: 'rgba(248,113,113,.1)',
              color: '#f87171', fontSize: '12px', fontWeight: 600,
            }}>
              O'chirish
            </button>
          )}
        </div>
      </div>

      {/* 2FA yoqilmagan holda — sozlash */}
      {!is2faEnabled && (
        <div style={card}>

          {/* Bosqich ko'rsatkichi */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i <= step ? 'var(--accent)' : 'var(--surface2)',
                  color:  i <= step ? 'white' : 'var(--text3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 6px',
                    background: i < step ? 'var(--accent)' : 'var(--border)',
                    transition: 'background .3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* BOSQICH 0 — Kirish */}
          {step === 0 && (
            <div style={{ textAlign: 'center' }}>
              <Smartphone size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                Google Authenticator bilan himoyalang
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                Telefondagi Google Authenticator ilovasini o'rnating.
                Har kirganingizda 6 raqamli kod so'raladi.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'App Store', href: 'https://apps.apple.com/app/google-authenticator/id388497605' },
                  { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                    padding: '8px 18px', borderRadius: '10px', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: '13px', textDecoration: 'none', fontWeight: 600,
                  }}>
                    {label}
                  </a>
                ))}
              </div>
              <button onClick={startSetup} disabled={loading} style={btn()}>
                {loading ? 'Yuklanmoqda...' : 'Sozlashni boshlash →'}
              </button>
            </div>
          )}

          {/* BOSQICH 1 — QR Kod */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
                QR kodni skanerlang
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '20px' }}>
                Google Authenticator ilovasini oching va <b>"+"</b> tugmasini bosib QR kodni skanerlang
              </p>

              {/* QR kod rasmi */}
              {qrCode && (
                <div style={{
                  display: 'inline-block', padding: '12px',
                  background: 'white', borderRadius: '14px',
                  marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,.15)',
                }}>
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR kod"
                    style={{ width: 180, height: 180, display: 'block' }}
                  />
                </div>
              )}

              {/* Qo'lda kiritish uchun secret */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text3)', fontSize: '12px', marginBottom: '6px' }}>
                  Yoki kodni qo'lda kiriting:
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--surface2)', borderRadius: '10px',
                  padding: '8px 12px', justifyContent: 'space-between',
                }}>
                  <code style={{
                    fontSize: '13px', fontFamily: 'monospace', letterSpacing: '2px',
                    color: 'var(--accent)', filter: showSecret ? 'none' : 'blur(4px)',
                    userSelect: showSecret ? 'text' : 'none', transition: 'filter .2s',
                  }}>
                    {secret}
                  </code>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setShowSecret(!showSecret)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '4px',
                    }}>
                      {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={copySecret} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '4px',
                    }}>
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} style={btn()}>
                Skanерladim →
              </button>
            </div>
          )}

          {/* BOSQICH 2 — Tasdiqlash */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
                Kodni tasdiqlang
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px' }}>
                Google Authenticator da ko'rsatilgan 6 raqamli kodni kiriting
              </p>

              {/* Kod input */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="tel"
                    maxLength={1}
                    value={code[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, '')
                      const arr = code.split('')
                      arr[i]    = val
                      const next = arr.join('')
                      setCode(next)
                      if (val && i < 5) {
                        document.getElementById(`otp-${i + 1}`)?.focus()
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !code[i] && i > 0) {
                        document.getElementById(`otp-${i - 1}`)?.focus()
                      }
                    }}
                    id={`otp-${i}`}
                    style={{
                      width: '44px', height: '52px', textAlign: 'center',
                      fontSize: '20px', fontWeight: 700,
                      background: 'var(--surface2)',
                      border: `2px solid ${code[i] ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '10px', color: 'var(--text)',
                      outline: 'none', transition: 'border-color .15s',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setStep(1)} style={btn(false)}>← Orqaga</button>
                <button onClick={verifyCode} disabled={loading || code.length < 6} style={btn()}>
                  {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash ✓'}
                </button>
              </div>
            </div>
          )}

          {/* BOSQICH 3 — Tayyor */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(34,197,94,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>
                2FA muvaffaqiyatli yoqildi! 🎉
              </h2>
              <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
                Endi har kirganingizda Google Authenticator dan 6 raqamli kod so'raladi.
                Telefoningizni yo'qotmasang!
              </p>
              <button onClick={() => navigate('/settings')} style={btn()}>
                Sozlamalarga qaytish
              </button>
            </div>
          )}

        </div>
      )}

      {/* 2FA yoqilgan holda — ma'lumot */}
      {is2faEnabled && (
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
            2FA haqida
          </h3>
          <ul style={{ color: 'var(--text3)', fontSize: '13px', lineHeight: 2, paddingLeft: '16px' }}>
            <li>Har kirganingizda 6 raqamli kod talab qilinadi</li>
            <li>Google Authenticator ilovasini o'chirмanг</li>
            <li>Telefon almashtirish oldidan 2FA ni o'chiring</li>
            <li>Kod 30 soniyada yangilanadi</li>
          </ul>
        </div>
      )}

    </div>
  )
}