// src/pages/Premium.jsx — To'liq versiya (Stripe + Payme + Click)
import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Crown, Check, Zap, Shield, Sparkles, CreditCard, Loader } from 'lucide-react'

const PLANS = [
  {
    id:       'free',
    name:     'Bepul',
    price:    0,
    period:   '',
    color:    '#64748b',
    bg:       'rgba(100,116,139,.08)',
    features: ['50 xabar/kun', '3 rasm/kun', 'Asosiy AI', 'Todo & Eslatmalar'],
    disabled: true,
  },
  {
    id:       'pro',
    name:     'Pro',
    price:    49000,
    period:   '/oy',
    color:    '#a78bfa',
    bg:       'rgba(167,139,250,.08)',
    popular:  true,
    features: ['500 xabar/kun', '20 rasm/kun', 'Ovozli chat', 'Agent', 'Fayl tahlili', 'Eksport'],
  },
  {
    id:       'premium',
    name:     'Premium',
    price:    99000,
    period:   '/oy',
    color:    '#f59e0b',
    bg:       'rgba(245,158,11,.08)',
    features: ['Cheksiz xabar & rasm', 'GPT-4 darajali', 'Ustuvor yordam', '2FA xavfsizlik', 'Barcha imkoniyatlar'],
  },
]

const PAYMENT_METHODS = [
  { id: 'payme', label: 'Payme',  logo: '💳', color: '#00AAFF' },
  { id: 'click', label: 'Click',  logo: '🔵', color: '#0064FF' },
  { id: 'stripe', label: 'Karta (Stripe)', logo: '💰', color: '#635BFF' },
]

export default function Premium() {
  const { user } = useAuthStore()
  const [selected,   setSelected]   = useState('pro')
  const [payMethod,  setPayMethod]  = useState('payme')
  const [loading,    setLoading]    = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const currentPlan = user?.plan || 'free'

  const handleSubscribe = async () => {
    if (selected === 'free' || selected === currentPlan) return
    setLoading(true)
    try {
      if (payMethod === 'stripe') {
        const { data } = await api.post('/api/payments/stripe/checkout', {
          plan:        selected,
          success_url: window.location.origin + '/dashboard?payment=success',
          cancel_url:  window.location.origin + '/premium',
        })
        window.location.href = data.checkout_url
      } else if (payMethod === 'payme') {
        // Payme URL yaratish
        const amount    = PLANS.find(p => p.id === selected)?.price || 0
        const accountB64 = btoa(JSON.stringify({ user_id: user.id, plan: selected }))
        const paymeUrl  = `https://checkout.paycom.uz/${accountB64}`
        window.open(paymeUrl, '_blank')
        toast.success("Payme orqali to'lov sahifasi ochildi")
      } else if (payMethod === 'click') {
        const amount     = PLANS.find(p => p.id === selected)?.price || 0
        const merchantId = "YOUR_CLICK_MERCHANT_ID"
        const serviceId  = "YOUR_CLICK_SERVICE_ID"
        const transId    = `${user.id}:${selected}`
        const clickUrl   = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transId}`
        window.open(clickUrl, '_blank')
        toast.success("Click orqali to'lov sahifasi ochildi")
      }
    } catch {
      toast.error("To'lov boshlanishida xato")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await api.post('/api/payments/cancel')
      toast.success("Obuna bekor qilindi")
      setShowCancel(false)
      window.location.reload()
    } catch {
      toast.error("Bekor qilishda xato")
    }
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', maxHeight: '100%' }}>

      {/* Sarlavha */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '16px',
          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Crown size={26} color="white" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>
          Premiumga o'ting
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
          Hozirgi rejim: <b style={{ color: currentPlan === 'free' ? 'var(--text2)' : '#a78bfa' }}>
            {currentPlan.toUpperCase()}
          </b>
        </p>
      </div>

      {/* Tariflar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        maxWidth: '820px',
        margin: '0 auto 28px',
      }}>
        {PLANS.map(plan => {
          const isActive   = currentPlan === plan.id
          const isSelected = selected === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => !plan.disabled && !isActive && setSelected(plan.id)}
              style={{
                background:   isSelected ? plan.bg : 'var(--surface)',
                border:       `2px solid ${isSelected ? plan.color : isActive ? plan.color + '60' : 'var(--border)'}`,
                borderRadius: '18px',
                padding:      '22px',
                cursor:       plan.disabled || isActive ? 'default' : 'pointer',
                position:     'relative',
                transition:   'all .2s',
                transform:    isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
                }}>
                  ⭐ Mashhur
                </div>
              )}

              {/* Joriy tarif */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: -12, right: 16,
                  background: plan.color, color: 'white',
                  fontSize: '10px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  Joriy
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: plan.color, marginBottom: '4px' }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900 }}>
                    {plan.price === 0 ? 'Bepul' : plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>so'm{plan.period}</span>
                  )}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '13px', color: 'var(--text2)', marginBottom: '7px',
                  }}>
                    <Check size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* To'lov usuli tanlash */}
      {selected !== 'free' && selected !== currentPlan && (
        <div style={{ maxWidth: '820px', margin: '0 auto 20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text2)' }}>
            To'lov usuli
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '8px',
                  padding:     '10px 18px',
                  borderRadius:'12px',
                  border:      `2px solid ${payMethod === m.id ? m.color : 'var(--border)'}`,
                  background:  payMethod === m.id ? `${m.color}15` : 'var(--surface)',
                  cursor:      'pointer',
                  fontSize:    '13px',
                  fontWeight:  600,
                  color:       payMethod === m.id ? m.color : 'var(--text2)',
                  transition:  'all .15s',
                  fontFamily:  'inherit',
                }}
              >
                <span style={{ fontSize: '18px' }}>{m.logo}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Obuna tugmasi */}
      {selected !== 'free' && selected !== currentPlan && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width:        '100%',
              padding:      '15px',
              borderRadius: '14px',
              border:       'none',
              cursor:       loading ? 'wait' : 'pointer',
              background:   'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color:        'white',
              fontSize:     '15px',
              fontWeight:   800,
              fontFamily:   'inherit',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              gap:          '8px',
              opacity:      loading ? 0.7 : 1,
              transition:   'all .15s',
            }}
          >
            {loading
              ? <><Loader size={16} className="spin" /> Yo'naltirilmoqda...</>
              : <><Sparkles size={16} /> {PLANS.find(p => p.id === selected)?.name} ga obuna bo'lish</>
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text3)', marginTop: '10px' }}>
            🔒 To'lov xavfsiz va shifrlangan • Istalgan vaqt bekor qilish mumkin
          </p>
        </div>
      )}

      {/* Obunani bekor qilish */}
      {currentPlan !== 'free' && (
        <div style={{ maxWidth: '820px', margin: '24px auto 0', textAlign: 'center' }}>
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', fontSize: '13px', textDecoration: 'underline',
              }}
            >
              Obunani bekor qilish
            </button>
          ) : (
            <div style={{
              background: 'rgba(248,113,113,.08)',
              border: '1px solid rgba(248,113,113,.2)',
              borderRadius: '14px', padding: '18px',
            }}>
              <p style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text2)' }}>
                Obunani bekor qilmoqchimisiz? Bepul rejimga o'tасиз.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowCancel(false)} style={{
                  padding: '8px 20px', borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'var(--surface)', cursor: 'pointer', fontSize: '13px',
                  color: 'var(--text)', fontFamily: 'inherit',
                }}>
                  Yo'q, qolaman
                </button>
                <button onClick={handleCancel} style={{
                  padding: '8px 20px', borderRadius: '10px', border: 'none',
                  background: 'rgba(248,113,113,.15)', cursor: 'pointer',
                  color: '#f87171', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                }}>
                  Ha, bekor qilish
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}