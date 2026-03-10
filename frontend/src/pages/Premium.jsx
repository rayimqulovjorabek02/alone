// src/pages/Premium.jsx
import api from '../api/client'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { Check, Zap, Crown } from 'lucide-react'

const PLANS = [
  {
    id: 'free', name: 'Bepul', price: '0 so\'m', icon: '🆓',
    features: ['50 xabar/kun', '3 rasm/kun', 'Asosiy chat', 'Edge TTS'],
    color: '#60a5fa',
  },
  {
    id: 'pro', name: 'Pro', price: '49,000 so\'m', icon: '⚡', popular: true,
    features: ['500 xabar/kun', '20 rasm/kun', 'Barcha modellar', 'ElevenLabs TTS', 'Agent', 'Fayl tahlil', 'Eksport'],
    color: '#a78bfa',
  },
  {
    id: 'premium', name: 'Premium', price: '99,000 so\'m', icon: '👑',
    features: ['Cheksiz xabar', 'Cheksiz rasm', 'Ustuvor javob', 'Barcha xususiyatlar', '7/24 yordam'],
    color: '#f59e0b',
  },
]

export default function Premium() {
  const { user } = useAuthStore()

  const handleSubscribe = async (plan) => {
    if (plan === 'free') return
    try {
      const { data } = await api.post('/api/payments/checkout', {
        plan,
        success_url: `${window.location.origin}/premium?success=1`,
        cancel_url:  `${window.location.origin}/premium`,
      })
      window.location.href = data.checkout_url
    } catch { toast.error("To'lov tizimi hozir mavjud emas") }
  }

  return (
    <div style={{ padding:'32px 24px', overflowY:'auto', height:'100%' }}>
      <div style={{ textAlign:'center', marginBottom:'36px' }}>
        <Crown size={40} style={{ color:'#f59e0b', marginBottom:'12px' }}/>
        <h1 style={{ fontSize:'26px', fontWeight:900, marginBottom:'6px' }}>Premium Planlar</h1>
        <p style={{ color:'var(--text3)', fontSize:'14px' }}>Alone AI ning to'liq imkoniyatlaridan foydalaning</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px', maxWidth:'800px', margin:'0 auto' }}>
        {PLANS.map(plan => (
          <div key={plan.id}
            style={{ background:'var(--surface)', border:`2px solid ${plan.popular?plan.color:'var(--border)'}`, borderRadius:'20px', padding:'24px', position:'relative',
              transform: plan.popular ? 'scale(1.03)' : 'none', boxShadow: plan.popular ? `0 0 30px ${plan.color}20` : 'none' }}>
            {plan.popular && (
              <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:plan.color, color:'white', fontSize:'11px', fontWeight:700, padding:'4px 14px', borderRadius:'20px' }}>
                MASHHUR
              </div>
            )}
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'36px', marginBottom:'8px' }}>{plan.icon}</div>
              <div style={{ fontSize:'18px', fontWeight:800 }}>{plan.name}</div>
              <div style={{ fontSize:'22px', fontWeight:900, color:plan.color, marginTop:'4px' }}>{plan.price}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)' }}>oyiga</div>
            </div>
            <ul style={{ listStyle:'none', marginBottom:'20px' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', fontSize:'13px', color:'var(--text2)' }}>
                  <Check size={14} style={{ color:plan.color, flexShrink:0 }}/>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={()=>handleSubscribe(plan.id)}
              disabled={user?.plan===plan.id}
              style={{ width:'100%', padding:'11px', borderRadius:'12px', border:'none', cursor:user?.plan===plan.id?'default':'pointer', fontWeight:700, fontSize:'13px',
                background: user?.plan===plan.id ? 'var(--surface2)' : `linear-gradient(135deg,${plan.color},${plan.color}cc)`,
                color: user?.plan===plan.id ? 'var(--text3)' : 'white' }}>
              {user?.plan===plan.id ? '✓ Joriy plan' : plan.id==='free' ? 'Bepul boshlash' : "Obuna bo'lish"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}