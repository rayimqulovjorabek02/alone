// src/components/Onboarding.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'
import { MessageSquare, Image, CheckSquare, Bell, Sparkles, ArrowRight, X } from 'lucide-react'

const STEPS = {
  uz: [
    {
      icon:  <Sparkles size={32} color="#a78bfa" />,
      title: "Alone AI ga xush kelibsiz! 🎉",
      desc:  "Sizning aqlli shaxsiy yordamchingiz. Keling, nimalarga qodirligini ko'rib chiqaylik.",
      action: null,
    },
    {
      icon:  <MessageSquare size={32} color="#60a5fa" />,
      title: "AI bilan suhbatlashing",
      desc:  "Istalgan savolga javob oling, kod yozdiring, matn tarjima qiling — 60+ tilda!",
      action: '/chat',
      actionLabel: "Chatga o'tish",
    },
    {
      icon:  <Image size={32} color="#f59e0b" />,
      title: "Rasm yarating",
      desc:  "Matn orqali chiroyli rasmlar yarating. 10+ uslub: realistik, anime, 3D va boshqalar.",
      action: '/image',
      actionLabel: "Rasm yaratish",
    },
    {
      icon:  <CheckSquare size={32} color="#22c55e" />,
      title: "Vazifalar va eslatmalar",
      desc:  "Kunlik vazifalaringizni boshqaring. Muhim ishlarni eslatmalar bilan kuzating.",
      action: '/todo',
      actionLabel: "Vazifalar",
    },
    {
      icon:  <Bell size={32} color="#f87171" />,
      title: "Hamma narsa tayyor!",
      desc:  "Sozlamalardan tilni, AI uslubini va ovozni o'zgartiring. Yaxshi foydalanish!",
      action: '/dashboard',
      actionLabel: "Boshlash",
    },
  ],
  ru: [
    {
      icon:  <Sparkles size={32} color="#a78bfa" />,
      title: "Добро пожаловать в Alone AI! 🎉",
      desc:  "Ваш умный персональный помощник. Давайте посмотрим, на что он способен.",
      action: null,
    },
    {
      icon:  <MessageSquare size={32} color="#60a5fa" />,
      title: "Общайтесь с AI",
      desc:  "Получайте ответы на любые вопросы, пишите код, переводите — на 60+ языках!",
      action: '/chat',
      actionLabel: "Открыть чат",
    },
    {
      icon:  <Image size={32} color="#f59e0b" />,
      title: "Создавайте изображения",
      desc:  "Генерируйте красивые изображения по тексту. 10+ стилей на выбор.",
      action: '/image',
      actionLabel: "Создать изображение",
    },
    {
      icon:  <CheckSquare size={32} color="#22c55e" />,
      title: "Задачи и напоминания",
      desc:  "Управляйте ежедневными задачами и не забывайте о важных делах.",
      action: '/todo',
      actionLabel: "Мои задачи",
    },
    {
      icon:  <Bell size={32} color="#f87171" />,
      title: "Всё готово!",
      desc:  "В настройках вы можете изменить язык, стиль AI и голос. Удачного использования!",
      action: '/dashboard',
      actionLabel: "Начать",
    },
  ],
  en: [
    {
      icon:  <Sparkles size={32} color="#a78bfa" />,
      title: "Welcome to Alone AI! 🎉",
      desc:  "Your smart personal assistant. Let's see what it can do.",
      action: null,
    },
    {
      icon:  <MessageSquare size={32} color="#60a5fa" />,
      title: "Chat with AI",
      desc:  "Get answers to any question, write code, translate — in 60+ languages!",
      action: '/chat',
      actionLabel: "Open chat",
    },
    {
      icon:  <Image size={32} color="#f59e0b" />,
      title: "Create images",
      desc:  "Generate beautiful images from text. 10+ styles to choose from.",
      action: '/image',
      actionLabel: "Create image",
    },
    {
      icon:  <CheckSquare size={32} color="#22c55e" />,
      title: "Tasks & Reminders",
      desc:  "Manage your daily tasks and track important things with reminders.",
      action: '/todo',
      actionLabel: "My tasks",
    },
    {
      icon:  <Bell size={32} color="#f87171" />,
      title: "All set!",
      desc:  "Change language, AI style and voice in settings. Enjoy!",
      action: '/dashboard',
      actionLabel: "Get started",
    },
  ],
}

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0)
  const navigate        = useNavigate()
  const { lang }        = useLang()

  const steps   = STEPS[lang] || STEPS.uz
  const current = steps[step]
  const isLast  = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onClose()
      if (current.action) navigate(current.action)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(0,0,0,0.7)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         9999,
      padding:        '20px',
      backdropFilter: 'blur(4px)',
      animation:      'fadeIn 0.3s ease',
    }}>
      <div style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--r-2xl)',
        padding:      '36px 32px',
        maxWidth:     '420px',
        width:        '100%',
        textAlign:    'center',
        position:     'relative',
        animation:    'fadeIn 0.4s var(--ease)',
        boxShadow:    'var(--shadow-lg)',
      }}>

        {/* Yopish tugmasi */}
        <button
          onClick={handleSkip}
          style={{
            position:  'absolute',
            top:       12,
            right:     12,
            background:'none',
            border:    'none',
            cursor:    'pointer',
            color:     'var(--text3)',
            display:   'flex',
            padding:   '4px',
            borderRadius: 'var(--r-sm)',
            transition:'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <X size={18} />
        </button>

        {/* Ikonka */}
        <div style={{
          width:          72,
          height:         72,
          borderRadius:   '20px',
          background:     'var(--surface2)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 20px',
        }}>
          {current.icon}
        </div>

        {/* Matn */}
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.3px' }}>
          {current.title}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.7, marginBottom: '28px' }}>
          {current.desc}
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width:        i === step ? 20 : 7,
                height:       7,
                borderRadius: '4px',
                background:   i === step ? 'var(--accent)' : 'var(--surface3)',
                transition:   'all .3s var(--ease)',
              }}
            />
          ))}
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex:         1,
                padding:      '11px',
                borderRadius: 'var(--r-lg)',
                border:       '1px solid var(--border)',
                background:   'var(--surface2)',
                color:        'var(--text2)',
                fontSize:     '14px',
                fontWeight:   600,
                cursor:       'pointer',
                fontFamily:   'var(--font)',
              }}
            >
              ←
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              flex:           1,
              padding:        '11px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              background:     'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          'white',
              fontSize:       '14px',
              fontWeight:     700,
              cursor:         'pointer',
              fontFamily:     'var(--font)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
              boxShadow:      '0 4px 16px rgba(124,58,237,0.35)',
              transition:     'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {isLast
              ? (lang === 'ru' ? 'Начать' : lang === 'en' ? 'Get started' : 'Boshlash')
              : (lang === 'ru' ? 'Далее' : lang === 'en' ? 'Next' : 'Keyingi')
            }
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={handleSkip}
            style={{
              marginTop:  '14px',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      'var(--text3)',
              fontSize:   '13px',
              fontFamily: 'var(--font)',
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            {lang === 'ru' ? 'Пропустить' : lang === 'en' ? 'Skip' : "O'tkazib yuborish"}
          </button>
        )}
      </div>
    </div>
  )
}