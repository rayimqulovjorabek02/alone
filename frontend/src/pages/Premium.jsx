// src/pages/Premium.jsx
import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Crown, Check, Sparkles } from 'lucide-react'

const PLANS = [
  {
    id: 'free', name: 'Bepul', price: 0, color: '#64748b',
    bg: 'rgba(100,116,139,.08)', disabled: true,
    features: ['50 xabar/kun', '3 rasm/kun', 'Asosiy AI', 'Todo & Eslatmalar'],
  },
  {
    id: 'pro', name: 'Pro', price: 49000, period: '/oy',
    color: '#a78bfa', bg: 'rgba(167,139,250,.08)', popular: true,
    features: ['500 xabar/kun', '20 rasm/kun', 'Ovozli chat', 'Agent', 'Fayl tahlili', 'Eksport'],
  },
  {
    id: 'premium', name: 'Premium', price: 99000, period: '/oy',
    color: '#f59e0b', bg: 'rgba(245,158,11,.08)',
    features: ['Cheksiz xabar & rasm', 'GPT-4 darajali', 'Ustuvor yordam', '2FA xavfsizlik', 'Barcha imkoniyatlar'],
  },
]

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Karta (Stripe)', logo: '💳', color: '#635BFF' },
  { id: 'payme',  label: 'Payme',          logo: '🔵', color: '#00AAFF' },
  { id: 'click',  label: 'Click',          logo: '🟢', color: '#0064FF' },
]

export default function Premium() {
  const { user } = useAuthStore()
  const [selected,  setSelected]  = useState('pro')
  const [payMethod, setPayMethod] = useState('stripe')
  const [loading,   setLoading]   = useState(false)
  const currentPlan = user?.plan || 'free'

  const selectedPlan = PLANS.find(p => p.id === selected)

  const handleSubscribe = async () => {
    if (selected === 'free' || selected === currentPlan) return
    setLoading(true)
    try {
      if (payMethod === 'stripe') {
        // Stripe sozlanmagan bo'lsa xabar ko'rsatish
        const stripeKey = import.meta.env.VITE_STRIPE_KEY
        if (!stripeKey) {
          toast.error("Stripe hali sozlanmagan. Payme yoki Click ishlatib ko'ring.")
          return
        }
        const { data } = await api.post('/api/payments/checkout', {
          plan:        selected,
          success_url: window.location.origin + '/dashboard?payment=success',
          cancel_url:  window.location.origin + '/premium',
        })
        window.location.href = data.checkout_url

      } else if (payMethod === 'payme') {
        const amount     = selectedPlan?.price || 0
        const accountB64 = btoa(JSON.stringify({ user_id: user?.id, plan: selected }))
        window.open(`https://checkout.paycom.uz/${accountB64}`, '_blank')
        toast.success("Payme sahifasi ochildi. To'lovdan so'ng qaytib keling.")

      } else if (payMethod === 'click') {
        const amount = selectedPlan?.price || 0
        // Click sozlamalari .env dan olish kerak
        const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || ''
        const serviceId  = import.meta.env.VITE_CLICK_SERVICE_ID  || ''
        if (!merchantId || !serviceId) {
          toast.error("Click hali sozlanmagan. Payme ishlatib ko'ring.")
          return
        }
        const transId  = `${user?.id}:${selected}:${Date.now()}`
        const clickUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${encodeURIComponent(transId)}`
        window.open(clickUrl, '_blank')
        toast.success("Click sahifasi ochildi. To'lovdan so'ng qaytib keling.")
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "To'lov boshlanishida xato")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%' }}>

      {/* Sarlavha */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Crown size={26} color="white" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Premiumga o'ting</h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
          Hozirgi rejim:{' '}
          <b style={{ color: currentPlan === 'free' ? 'var(--text2)' : '#a78bfa' }}>
            {currentPlan.toUpperCase()}
          </b>
        </p>
      </div>

      {/* Tariflar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', maxWidth: '820px', margin: '0 auto 28px' }}>
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
                opacity:      plan.disabled ? 0.7 : 1,
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  ⭐ Mashhur
                </div>
              )}
              {isActive && (
                <div style={{ position: 'absolute', top: -12, right: 16, background: plan.color, color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                  Joriy
                </div>
              )}

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: plan.color, marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ fontSize: '26px', fontWeight: 900, marginBottom: '16px' }}>
                {plan.price === 0 ? 'Bepul' : plan.price.toLocaleString('uz-UZ')}
                {plan.price > 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 400 }}> so'm{plan.period}</span>
                )}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text2)', marginBottom: '7px' }}>
                    <Check size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* To'lov bo'limi — faqat tanlangan plan joriydan farqli bo'lsa */}
      {selected !== 'free' && selected !== currentPlan && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* To'lov usuli */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text2)' }}>
            To'lov usuli
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPayMethod(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '12px',
                  border: `2px solid ${payMethod === m.id ? m.color : 'var(--border)'}`,
                  background: payMethod === m.id ? `${m.color}15` : 'var(--surface)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  color: payMethod === m.id ? m.color : 'var(--text2)',
                  fontFamily: 'inherit', transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{m.logo}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Narx ko'rsatish */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text2)' }}>
              {selectedPlan?.name} rejim
            </span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: selectedPlan?.color }}>
              {selectedPlan?.price?.toLocaleString('uz-UZ')} so'm/oy
            </span>
          </div>

          {/* Obuna tugmasi */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
              color: 'white', fontSize: '15px', fontWeight: 800,
              fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1,
              transition: 'opacity .15s',
            }}
          >
            {loading
              ? '⏳ Yo\'naltirilmoqda...'
              : <><Sparkles size={16} /> {selectedPlan?.name} ga obuna bo'lish</>
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text3)', marginTop: '10px' }}>
            🔒 To'lov xavfsiz va shifrlangan • Istalgan vaqt bekor qilish mumkin
          </p>
        </div>
      )}

      {/* Joriy plan premium/pro bo'lsa — info */}
      {currentPlan !== 'free' && (
        <div style={{ maxWidth: '820px', margin: '20px auto 0', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Obunani bekor qilish uchun{' '}
            <a href="mailto:support@aloneai.uz" style={{ color: '#a78bfa' }}>support@aloneai.uz</a>
            {' '}ga murojaat qiling
          </p>
        </div>
      )}
    </div>
  )
}