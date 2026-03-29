// src/pages/Premium.jsx
import { useState, useEffect } from 'react'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useAuthStore }        from '../store/authStore'
import { useLang }             from '../i18n/LanguageContext'
import { Crown, Check, Clock, Sparkles, Send } from 'lucide-react'

const PLANS = {
  uz: [
    { id:'free',    name:'Bepul',   price:"0 so'm",       color:'#64748b', bg:'rgba(100,116,139,.08)', disabled:true,
      features:['50 xabar/kun','3 rasm/kun','Asosiy AI','Todo & Eslatmalar'] },
    { id:'pro',     name:'Pro',     price:"49,000 so'm",   period:'/oy', color:'#a78bfa', bg:'rgba(167,139,250,.08)', popular:true,
      features:['500 xabar/kun','20 rasm/kun','Ovozli chat','Agent','Fayl tahlili','Eksport'] },
    { id:'premium', name:'Premium', price:"99,000 so'm",   period:'/oy', color:'#f59e0b', bg:'rgba(245,158,11,.08)',
      features:["Cheksiz xabar & rasm","GPT-4 darajali","Ustuvor yordam","2FA xavfsizlik","Barcha imkoniyatlar"] },
  ],
  ru: [
    { id:'free',    name:'Бесплатно', price:"0",             color:'#64748b', bg:'rgba(100,116,139,.08)', disabled:true,
      features:['50 сообщ/день','3 изобр/день','Базовый AI','Задачи & Напоминания'] },
    { id:'pro',     name:'Pro',       price:"49,000 сум",     period:'/мес', color:'#a78bfa', bg:'rgba(167,139,250,.08)', popular:true,
      features:['500 сообщ/день','20 изобр/день','Голосовой чат','Агент','Анализ файлов','Экспорт'] },
    { id:'premium', name:'Premium',   price:"99,000 сум",     period:'/мес', color:'#f59e0b', bg:'rgba(245,158,11,.08)',
      features:['Безлимитно','Уровень GPT-4','Приоритет','2FA','Все функции'] },
  ],
  en: [
    { id:'free',    name:'Free',    price:"Free",           color:'#64748b', bg:'rgba(100,116,139,.08)', disabled:true,
      features:['50 msg/day','3 img/day','Basic AI','Todos & Reminders'] },
    { id:'pro',     name:'Pro',     price:"49,000 UZS",     period:'/mo', color:'#a78bfa', bg:'rgba(167,139,250,.08)', popular:true,
      features:['500 msg/day','20 img/day','Voice chat','Agent','File analysis','Export'] },
    { id:'premium', name:'Premium', price:"99,000 UZS",     period:'/mo', color:'#f59e0b', bg:'rgba(245,158,11,.08)',
      features:['Unlimited','GPT-4 level','Priority','2FA','All features'] },
  ],
}

export default function Premium() {
  const { user }                 = useAuthStore()
  const { lang }                 = useLang()
  const [selected, setSelected]  = useState('pro')
  const [loading,  setLoading]   = useState(false)
  const [note,     setNote]      = useState('')
  const [pending,  setPending]   = useState(null)
  const [showNote, setShowNote]  = useState(false)
  const currentPlan              = user?.plan || 'free'
  const plans                    = PLANS[lang] || PLANS.uz

  useEffect(() => {
    api.get('/api/payments/my-plan')
      .then(r => setPending(r.data.pending))
      .catch(() => {})
  }, [])

  const handleSubscribe = async () => {
    if (selected === 'free' || selected === currentPlan) return
    setLoading(true)
    try {
      await api.post('/api/payments/subscribe', { plan: selected, note: note.trim() || null })
      toast.success(
        lang === 'ru' ? 'Запрос отправлен! Admin свяжется с вами.' :
        lang === 'en' ? 'Request sent! Admin will contact you.' :
                        "So'rov yuborildi! Admin siz bilan bog'lanadi.",
        { duration: 5000, icon: '👑' }
      )
      setPending({ plan: selected, status: 'pending' })
      setShowNote(false); setNote('')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Xato')
    } finally { setLoading(false) }
  }

  const sel = plans.find(p => p.id === selected)

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'860px', margin:'0 auto' }}>

      {/* Sarlavha */}
      <div style={{ textAlign:'center', marginBottom:'28px' }}>
        <div style={{ width:52, height:52, borderRadius:'14px', background:'rgba(245,158,11,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
          <Crown size={24} style={{ color:'#f59e0b' }}/>
        </div>
        <h1 style={{ fontSize:'24px', fontWeight:800, letterSpacing:'-0.4px', marginBottom:'6px' }}>
          {lang==='ru'?'Выберите тариф':lang==='en'?'Choose a plan':'Tarif tanlang'}
        </h1>
        <p style={{ color:'var(--text3)', fontSize:'13px' }}>
          {lang==='ru'?"Оплата принимается через администратора":lang==='en'?"Payment processed by admin":"To'lov admin orqali qabul qilinadi"}
        </p>
      </div>

      {/* Pending */}
      {pending && (
        <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:'var(--r-xl)', marginBottom:'20px' }}>
          <Clock size={18} style={{ color:'#f59e0b', flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'#f59e0b' }}>
              {lang==='ru'?'Запрос на рассмотрении':lang==='en'?'Request pending':"So'rov ko'rib chiqilmoqda"}
            </div>
            <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'2px' }}>
              {lang==='ru'?`Тариф: ${pending.plan} — 24 часа`:lang==='en'?`Plan: ${pending.plan} — 24 hours`:`Plan: ${pending.plan} — 24 soat`}
            </div>
          </div>
        </div>
      )}

      {/* Planlar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(230px, 1fr))', gap:'14px', marginBottom:'24px' }}>
        {plans.map(plan => {
          const isCurrent  = plan.id === currentPlan
          const isSelected = plan.id === selected
          return (
            <div key={plan.id}
              onClick={() => !plan.disabled && !isCurrent && setSelected(plan.id)}
              style={{ position:'relative', background:isSelected?plan.bg:'var(--surface)', border:`2px solid ${isSelected?plan.color:'var(--border)'}`, borderRadius:'var(--r-2xl)', padding:'22px', cursor:plan.disabled||isCurrent?'default':'pointer', transition:'all .2s', opacity:plan.disabled?0.7:1 }}
              onMouseEnter={e=>{ if(!plan.disabled&&!isCurrent) e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
            >
              {plan.popular && <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#a78bfa,#7c3aed)', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 12px', borderRadius:'100px', whiteSpace:'nowrap' }}>
                ⭐ {lang==='ru'?'Популярный':lang==='en'?'Popular':'Mashhur'}
              </div>}
              {isCurrent && <div style={{ position:'absolute', top:-11, right:14, background:'var(--success)', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'100px' }}>
                ✓ {lang==='ru'?'Текущий':lang==='en'?'Current':'Hozirgi'}
              </div>}
              <h3 style={{ fontSize:'17px', fontWeight:800, color:plan.color, marginBottom:'4px' }}>{plan.name}</h3>
              <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'16px' }}>
                <span style={{ fontSize:'20px', fontWeight:800 }}>{plan.price}</span>
                {plan.period && <span style={{ fontSize:'12px', color:'var(--text3)' }}>{plan.period}</span>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--text2)' }}>
                    <Check size={13} style={{ color:plan.color, flexShrink:0 }}/>{f}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* So'rov yuborish */}
      {selected !== 'free' && selected !== currentPlan && !pending && (
        <div style={{ maxWidth:'460px', margin:'0 auto' }}>
          {showNote && (
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
              placeholder={lang==='ru'?'Дополнительное сообщение...':lang==='en'?'Additional message...':'Qo\'shimcha xabar...'}
              style={{ width:'100%', padding:'12px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', color:'var(--text)', fontSize:'13px', resize:'none', outline:'none', fontFamily:'var(--font)', boxSizing:'border-box', marginBottom:'10px' }}
            />
          )}
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={()=>setShowNote(s=>!s)}
              style={{ padding:'12px 14px', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text3)', fontSize:'13px', cursor:'pointer', fontFamily:'var(--font)' }}>
              ✏️
            </button>
            <button onClick={handleSubscribe} disabled={loading}
              style={{ flex:1, padding:'12px', borderRadius:'var(--r-lg)', border:'none', cursor:loading?'wait':'pointer', background:`linear-gradient(135deg,${sel?.color||'#7c3aed'},#6d28d9)`, color:'white', fontSize:'14px', fontWeight:700, fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loading?0.7:1, boxShadow:'0 4px 16px rgba(124,58,237,0.3)' }}>
              <Send size={15}/>
              {loading?(lang==='ru'?'Отправка...':lang==='en'?'Sending...':'Yuborilmoqda...')
                      :(lang==='ru'?`Запросить ${sel?.name}`:lang==='en'?`Request ${sel?.name}`:`${sel?.name} so'rash`)}
            </button>
          </div>
          <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text3)', marginTop:'10px' }}>
            💡 {lang==='ru'?'Admin активирует план в течение 24 часов':lang==='en'?'Admin will activate your plan within 24 hours':'Admin 24 soat ichida planini faollashtiradi'}
          </p>
        </div>
      )}

      {currentPlan !== 'free' && (
        <div style={{ textAlign:'center', marginTop:'20px', padding:'14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)' }}>
          <Sparkles size={16} style={{ color:'#f59e0b', marginBottom:'4px' }}/>
          <div style={{ fontSize:'13px', fontWeight:600 }}>
            {lang==='ru'?`Вы на тарифе ${currentPlan}`:lang==='en'?`You are on ${currentPlan} plan`:`Siz ${currentPlan} planida siz`}
          </div>
        </div>
      )}
    </div>
  )
}