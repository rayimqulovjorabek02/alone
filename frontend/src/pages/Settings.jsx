// src/pages/Settings.jsx
import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { code: 'uz', label: '🇺🇿 O\'zbek' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'pt', label: '🇵🇹 Português' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'fa', label: '🇮🇷 فارسی' },
  { code: 'kk', label: '🇰🇿 Қазақша' },
  { code: 'ky', label: '🇰🇬 Кыргызча' },
  { code: 'tg', label: '🇹🇯 Тоҷикӣ' },
  { code: 'az', label: '🇦🇿 Azərbaycan' },
  { code: 'tk', label: '🇹🇲 Türkmençe' },
  { code: 'uk', label: '🇺🇦 Українська' },
  { code: 'pl', label: '🇵🇱 Polski' },
  { code: 'nl', label: '🇳🇱 Nederlands' },
  { code: 'sv', label: '🇸🇪 Svenska' },
  { code: 'no', label: '🇳🇴 Norsk' },
  { code: 'da', label: '🇩🇰 Dansk' },
  { code: 'fi', label: '🇫🇮 Suomi' },
  { code: 'cs', label: '🇨🇿 Čeština' },
  { code: 'ro', label: '🇷🇴 Română' },
  { code: 'hu', label: '🇭🇺 Magyar' },
  { code: 'id', label: '🇮🇩 Bahasa Indonesia' },
  { code: 'ms', label: '🇲🇾 Bahasa Melayu' },
  { code: 'th', label: '🇹🇭 ภาษาไทย' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'bn', label: '🇧🇩 বাংলা' },
  { code: 'ur', label: '🇵🇰 اردو' },
  { code: 'he', label: '🇮🇱 עברית' },
  { code: 'el', label: '🇬🇷 Ελληνικά' },
  { code: 'bg', label: '🇧🇬 Български' },
  { code: 'sr', label: '🇷🇸 Српски' },
  { code: 'hr', label: '🇭🇷 Hrvatski' },
  { code: 'sk', label: '🇸🇰 Slovenčina' },
  { code: 'lt', label: '🇱🇹 Lietuvių' },
  { code: 'lv', label: '🇱🇻 Latviešu' },
  { code: 'et', label: '🇪🇪 Eesti' },
  { code: 'ka', label: '🇬🇪 ქართული' },
  { code: 'hy', label: '🇦🇲 Հայերեն' },
  { code: 'sw', label: '🇰🇪 Kiswahili' },
  { code: 'af', label: '🇿🇦 Afrikaans' },
]

const STYLES = [
  ['friendly',     'Do\'stona'],
  ['professional', 'Professional'],
  ['funny',        'Quvnoq'],
  ['strict',       'Qisqa'],
  ['teacher',      'O\'qituvchi'],
]

const VOICES = [
  ['default',     'Standart (Madina)'],
  ['male',        'Erkak (Sardor)'],
  ['elevenlabs',  'ElevenLabs (Premium)'],
]

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
      <h3 style={{ fontSize:'14px', fontWeight:700, marginBottom:'16px', color:'var(--text2)' }}>{title}</h3>
      {children}
    </div>
  )
}

function SelectGroup({ value, options, onChange }) {
  return (
    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
      {options.map(([val, lbl]) => (
        <button key={val} onClick={() => onChange(val)}
          style={{ padding:'7px 14px', borderRadius:'8px', border:`1px solid ${value===val?'var(--accent)':'var(--border)'}`, cursor:'pointer', fontSize:'12px', fontWeight:value===val?700:400,
            background:value===val?'rgba(124,58,237,.15)':'var(--bg)', color:value===val?'#a78bfa':'var(--text3)' }}>
          {lbl}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const { settings, save } = useSettingsStore()
  const [form, setForm]    = useState({ ...settings })
  const [saving, setSaving]= useState(false)
  const [langSearch, setLangSearch] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await save(form)
      toast.success("Saqlandi!")
    } catch { toast.error("Xato") } finally { setSaving(false) }
  }

  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'600px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'24px' }}>⚙️ Sozlamalar</h1>

      <Section title="👤 Profil">
        <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>Ismingiz</label>
        <input
          value={form.name || ''}
          onChange={e => update('name', e.target.value)}
          placeholder="Ismingiz"
          style={{ width:'100%', padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
        />
      </Section>

      <Section title="🌍 Til">
        {/* Qidiruv */}
        <input
          value={langSearch}
          onChange={e => setLangSearch(e.target.value)}
          placeholder="Til qidirish..."
          style={{ width:'100%', padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontSize:'13px', outline:'none', boxSizing:'border-box', marginBottom:'10px' }}
        />
        {/* Tanlangan til */}
        {form.language && (
          <div style={{ fontSize:'12px', color:'var(--text3)', marginBottom:'8px' }}>
            Tanlangan: <span style={{ color:'#a78bfa', fontWeight:700 }}>
              {LANGUAGES.find(l => l.code === form.language)?.label || form.language}
            </span>
          </div>
        )}
        {/* Til ro'yxati */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', maxHeight:'200px', overflowY:'auto', padding:'4px 0' }}>
          {filteredLangs.map(({ code, label }) => (
            <button key={code} onClick={() => update('language', code)}
              style={{ padding:'6px 12px', borderRadius:'8px', border:`1px solid ${form.language===code?'var(--accent)':'var(--border)'}`, cursor:'pointer', fontSize:'12px', fontWeight:form.language===code?700:400,
                background:form.language===code?'rgba(124,58,237,.15)':'var(--bg)', color:form.language===code?'#a78bfa':'var(--text3)', whiteSpace:'nowrap' }}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="🎭 AI Uslubi">
        <SelectGroup value={form.ai_style} options={STYLES} onChange={v => update('ai_style', v)} />
      </Section>

      <Section title="🎙️ Ovoz">
        <SelectGroup value={form.tts_voice} options={VOICES} onChange={v => update('tts_voice', v)} />
      </Section>

      <Section title="🌡️ Ijodkorlik darajasi">
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>Aniq</span>
          <input type="range" min="0" max="1" step="0.1" value={form.temperature}
            onChange={e => update('temperature', parseFloat(e.target.value))}
            style={{ flex:1, accentColor:'var(--accent)' }}/>
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>Ijodiy</span>
          <span style={{ fontSize:'13px', fontWeight:700, color:'#a78bfa', minWidth:30 }}>{form.temperature}</span>
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving}
        style={{ width:'100%', padding:'13px', borderRadius:'12px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', fontSize:'14px', fontWeight:700 }}>
        {saving ? '⏳...' : '💾 Saqlash'}
      </button>
    </div>
  )
}