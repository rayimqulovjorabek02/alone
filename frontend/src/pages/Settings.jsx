// src/pages/Settings.jsx
import { useState }          from 'react'
import { useSettingsStore }  from '../store/settingsStore'
import { useLang }           from '../i18n/LanguageContext'
import toast                 from 'react-hot-toast'
import { Save, Globe, Palette, Mic, Sliders, User, Search, Check } from 'lucide-react'


// ── Interfeys tillari (faqat 3 ta) ───────────────────────────
const UI_LANGUAGES = [
  { code: 'uz', label: "O'zbek",  flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]



// ── Bo'lim komponenti ─────────────────────────────────────────
function Section({ title, icon: Icon, children, delay }) {
  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding:      '22px',
      marginBottom: '14px',
      animation:    `fadeIn 0.35s var(--ease) ${delay || 0}ms both`,
    }}>
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        marginBottom:'18px',
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   'var(--r-md)',
          background:     'var(--surface2)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: 'var(--text3)' }} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}


export default function Settings() {
  const { settings, save }          = useSettingsStore()
  const { t, lang, changeLang }     = useLang()
  const [form,        setForm]      = useState({ ...settings })
  const [saving,        setSaving]       = useState(false)
  const [langSearch,    setLangSearch]   = useState('')
  const [focused,        setFocused]        = useState(false)
  const [langFocused,   setLangFocused]  = useState(false)

  // Sozlamani yangilash
  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    // Faqat interfeys tili o'zgartirsa — UI ni yangilash
    if (k === 'language') {
      changeLang(v)
      localStorage.setItem('lang', v)
      window.dispatchEvent(new CustomEvent('lang-change', { detail: v }))
    }
  }

  // Saqlash
  const handleSave = async () => {
    setSaving(true)
    try {
      await save(form)
      toast.success(t('success') + ' ✓')
    } catch {
      toast.error(t('error'))
    } finally {
      setSaving(false)
    }
  }

  // Til qidirish filtri
  // Interfeys tili filtri (3 ta)
  const filteredUILangs = UI_LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )


  const selectedLang = UI_LANGUAGES.find(l => l.code === form.language)

  // Ijodkorlik darajasi labeli
  const tempLabels = {
    uz: { 0: 'Juda aniq', 0.1: 'Aniq', 0.3: 'Barqaror', 0.5: "O'rtacha", 0.7: 'Erkin', 0.9: 'Ijodiy', 1: 'Maksimal' },
    ru: { 0: 'Очень точно', 0.1: 'Точно', 0.3: 'Стабильно', 0.5: 'Умеренно', 0.7: 'Свободно', 0.9: 'Творчески', 1: 'Максимально' },
    en: { 0: 'Very precise', 0.1: 'Precise', 0.3: 'Stable', 0.5: 'Moderate', 0.7: 'Free', 0.9: 'Creative', 1: 'Maximum' },
  }
  const tempLabel = (tempLabels[lang] || tempLabels.uz)[form.temperature] || `${form.temperature}`

  // AI uslublari
  const STYLES = [
    { value: 'friendly',     emoji: '😊', label: { uz: "Do'stona",    ru: 'Дружелюбный', en: 'Friendly' },     desc: { uz: 'Iliq va samimiy',    ru: 'Тёплый и искренний', en: 'Warm and sincere' } },
    { value: 'professional', emoji: '💼', label: { uz: 'Professional', ru: 'Профессиональный', en: 'Professional' }, desc: { uz: 'Rasmiy va aniq',   ru: 'Официальный',        en: 'Formal and precise' } },
    { value: 'funny',        emoji: '😄', label: { uz: 'Quvnoq',       ru: 'Весёлый',     en: 'Funny' },        desc: { uz: 'Hazilkash',          ru: 'С юмором',           en: 'With humor' } },
    { value: 'strict',       emoji: '⚡', label: { uz: 'Qisqa',        ru: 'Краткий',     en: 'Concise' },      desc: { uz: 'Faqat asosiy',       ru: 'Только главное',     en: 'Just the key points' } },
    { value: 'teacher',      emoji: '📚', label: { uz: "O'qituvchi",   ru: 'Учитель',     en: 'Teacher' },      desc: { uz: 'Tushuntirib beradi', ru: 'Объясняет подробно', en: 'Explains in detail' } },
  ]

  // Ovozlar
  const VOICES = [
    { value: 'default',    emoji: '🔊', label: { uz: 'Google TTS',  ru: 'Google TTS',  en: 'Google TTS' },  desc: { uz: 'Tabiiy ovoz (bepul)', ru: 'Натуральный голос (бесплатно)', en: 'Natural voice (free)' } },
    { value: 'elevenlabs', emoji: '✨', label: { uz: 'ElevenLabs',  ru: 'ElevenLabs',  en: 'ElevenLabs' }, desc: { uz: 'Premium sifat',        ru: 'Премиум качество',             en: 'Premium quality' } },
  ]

  return (
    <div style={{
      padding:   '28px 24px',
      overflowY: 'auto',
      height:    '100%',
      maxWidth:  '600px',
      margin:    '0 auto',
    }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
          {t('settings')}
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '13px', marginTop: '4px' }}>
          { lang === 'uz' && 'AI va interfeys xususiyatlarini sozlang' }
          { lang === 'ru' && 'Настройте параметры AI и интерфейса' }
          { lang === 'en' && 'Configure AI and interface settings' }
        </p>
      </div>

      {/* ── Ism bo'limi ───────────────────────────────────────── */}
      <Section title={t('yourName')} icon={User} delay={0}>
        <label style={{
          fontSize:      '12px',
          fontWeight:    600,
          color:         'var(--text3)',
          display:       'block',
          marginBottom:  '7px',
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
        }}>
          { lang === 'uz' && 'AI sizni qanday chaqirsin?' }
          { lang === 'ru' && 'Как AI к вам обращается?' }
          { lang === 'en' && 'How should AI call you?' }
        </label>
        <input
          value={form.name || ''}
          onChange={e => update('name', e.target.value)}
          placeholder={
            lang === 'uz' ? 'Ismingiz...' :
            lang === 'ru' ? 'Ваше имя...' : 'Your name...'
          }
          style={{
            width:        '100%',
            padding:      '11px 14px',
            background:   'var(--bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            color:        'var(--text)',
            fontSize:     '14px',
            outline:      'none',
            boxSizing:    'border-box',
            transition:   'border-color .2s, box-shadow .2s',
            fontFamily:   'var(--font)',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent)'
            e.target.style.boxShadow   = '0 0 0 3px var(--accent-soft)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow   = 'none'
          }}
        />
      </Section>

      {/* ── Til bo'limi ───────────────────────────────────────── */}
      <Section title={t('interfaceLang')} icon={Globe} delay={60}>

        {/* Tanlangan til ko'rsatkichi */}
        {selectedLang && (
          <div style={{
            display:     'inline-flex',
            alignItems:  'center',
            gap:         '7px',
            padding:     '6px 12px',
            borderRadius:'var(--r-lg)',
            background:  'var(--accent-soft)',
            border:      '1px solid rgba(124,58,237,0.2)',
            marginBottom:'12px',
            fontSize:    '13px',
            fontWeight:  600,
            color:       '#a78bfa',
          }}>
            <span>{selectedLang.flag}</span>
            {selectedLang.label}
            <Check size={12} />
          </div>
        )}

        {/* Qidiruv maydoni */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <Search size={14} style={{
            position:      'absolute',
            left:          11,
            top:           '50%',
            transform:     'translateY(-50%)',
            color:         'var(--text3)',
            pointerEvents: 'none',
          }} />
          <input
            value={langSearch}
            onChange={e => setLangSearch(e.target.value)}
            onFocus={() => setLangFocused(true)}
            onBlur={() => setLangFocused(false)}
            placeholder={t('searchLang')}
            style={{
              width:        '100%',
              padding:      '9px 12px 9px 32px',
              background:   'var(--bg)',
              border:       `1px solid ${langFocused ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--r-lg)',
              color:        'var(--text)',
              fontSize:     '13px',
              outline:      'none',
              boxSizing:    'border-box',
              transition:   'border-color .2s',
              fontFamily:   'var(--font)',
            }}
          />
        </div>

        {/* Tillar ro'yxati — faqat 3 ta UI tili */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '2px' }}>
          {filteredUILangs.map(({ code, label, flag }) => {
            const isSelected = form.language === code
            return (
              <button
                key={code}
                onClick={() => update('language', code)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '5px',
                  padding:     '8px 16px',
                  borderRadius:'var(--r-md)',
                  border:      `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  cursor:      'pointer',
                  fontSize:    '13px',
                  fontWeight:  isSelected ? 700 : 400,
                  background:  isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                  color:       isSelected ? '#a78bfa' : 'var(--text3)',
                  whiteSpace:  'nowrap',
                  transition:  'all .15s',
                  fontFamily:  'var(--font)',
                }}
              >
                <span>{flag}</span>
                {label}
                {isSelected && <Check size={13} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ── AI Uslubi ─────────────────────────────────────────── */}
      <Section title={t('aiStyle')} icon={Palette} delay={120}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap:                 '8px',
        }}>
          {STYLES.map(({ value, emoji, label, desc }) => {
            const isSelected = form.ai_style === value
            return (
              <button
                key={value}
                onClick={() => update('ai_style', value)}
                style={{
                  display:      'flex',
                  flexDirection:'column',
                  alignItems:   'flex-start',
                  gap:          '4px',
                  padding:      '12px',
                  borderRadius: 'var(--r-lg)',
                  border:       `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  cursor:       'pointer',
                  background:   isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                  transition:   'all .15s',
                  textAlign:    'left',
                  fontFamily:   'var(--font)',
                }}
              >
                <span style={{ fontSize: '20px' }}>{emoji}</span>
                <span style={{
                  fontSize:  '13px',
                  fontWeight: 700,
                  color:      isSelected ? '#a78bfa' : 'var(--text)',
                }}>
                  {label[lang] || label.uz}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {desc[lang] || desc.uz}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* ── Ovoz ─────────────────────────────────────────────── */}
      <Section title={t('ttsVoice')} icon={Mic} delay={180}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {VOICES.map(({ value, emoji, label, desc }) => {
            const isSelected = form.tts_voice === value
            return (
              <button
                key={value}
                onClick={() => update('tts_voice', value)}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '12px',
                  padding:    '12px 14px',
                  borderRadius:'var(--r-lg)',
                  border:     `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  cursor:     'pointer',
                  background: isSelected ? 'var(--accent-soft)' : 'var(--bg)',
                  transition: 'all .15s',
                  fontFamily: 'var(--font)',
                  textAlign:  'left',
                }}
              >
                <span style={{ fontSize: '22px', width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize:  '13px',
                    fontWeight: 600,
                    color:      isSelected ? '#a78bfa' : 'var(--text)',
                  }}>
                    {label[lang] || label.uz}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '1px' }}>
                    {desc[lang] || desc.uz}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width:          20,
                    height:         20,
                    borderRadius:   '50%',
                    background:     'var(--accent)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                  }}>
                    <Check size={11} color="white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      {/* ── Ijodkorlik darajasi ───────────────────────────────── */}
      <Section title={t('creativity')} icon={Sliders} delay={240}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text3)', width: 60 }}>
            {t('precise')}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={form.temperature}
            onChange={e => update('temperature', parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', height: '4px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text3)', width: 60, textAlign: 'right' }}>
            {t('creative')}
          </span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display:     'inline-flex',
            alignItems:  'center',
            gap:         '6px',
            padding:     '5px 14px',
            borderRadius:'100px',
            background:  'var(--accent-soft)',
            color:       '#a78bfa',
            fontSize:    '12px',
            fontWeight:  700,
          }}>
            {tempLabel} — {form.temperature}
          </span>
        </div>
      </Section>

      {/* ── Saqlash tugmasi ───────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width:          '100%',
          padding:        '13px',
          borderRadius:   'var(--r-lg)',
          border:         'none',
          cursor:         saving ? 'not-allowed' : 'pointer',
          background:     saving ? 'var(--surface3)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color:          saving ? 'var(--text3)' : 'white',
          fontSize:       '14px',
          fontWeight:     700,
          fontFamily:     'var(--font)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '8px',
          transition:     'all .2s',
          boxShadow:      saving ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
          animation:      'fadeIn 0.5s var(--ease) 300ms both',
        }}
      >
        {saving ? (
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
            <Save size={16} />
            {t('saveSettings')}
          </>
        )}
      </button>
    </div>
  )
}