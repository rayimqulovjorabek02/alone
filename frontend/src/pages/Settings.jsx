// src/pages/Settings.jsx
import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import toast from 'react-hot-toast'

const LANGS   = [['uz','🇺🇿 O\'zbek'],['ru','🇷🇺 Rus'],['en','🇬🇧 Ingliz']]
const STYLES  = [['friendly','Do\'stona'],['professional','Professional'],['funny','Quvnoq'],['strict','Qisqa'],['teacher','O\'qituvchi']]
const VOICES  = [['default','Standart (Madina)'],['male','Erkak (Sardor)'],['elevenlabs','ElevenLabs (Premium)']]
const THEMES  = [['dark','Qorong\'u'],['light','Yorug\'']]

export default function Settings() {
  const { settings, save } = useSettingsStore()
  const [form, setForm]    = useState({ ...settings })
  const [saving, setSaving]= useState(false)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await save(form)
      toast.success("Saqlandi!")
    } catch { toast.error("Xato") } finally { setSaving(false) }
  }

  const Section = ({ title, children }) => (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
      <h3 style={{ fontSize:'14px', fontWeight:700, marginBottom:'16px', color:'var(--text2)' }}>{title}</h3>
      {children}
    </div>
  )

  const Select = ({ label, value, options, onChange }) => (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>{label}</label>
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {options.map(([val, lbl]) => (
          <button key={val} onClick={()=>onChange(val)}
            style={{ padding:'7px 14px', borderRadius:'8px', border:`1px solid ${value===val?'var(--accent)':'var(--border)'}`, cursor:'pointer', fontSize:'12px', fontWeight:value===val?700:400,
              background:value===val?'rgba(124,58,237,.15)':'var(--bg)', color:value===val?'#a78bfa':'var(--text3)' }}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'600px', margin:'0 auto' }}>
      <h1 style={{ fontSize:'22px', fontWeight:800, marginBottom:'24px' }}>⚙️ Sozlamalar</h1>

      <Section title="👤 Profil">
        <label style={{ fontSize:'13px', color:'var(--text3)', display:'block', marginBottom:'6px' }}>Ismingiz</label>
        <input value={form.name||''} onChange={e=>update('name',e.target.value)}
          placeholder="Ismingiz"
          style={{ width:'100%', padding:'10px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box' }}/>
      </Section>

      <Section title="🌍 Til">
        <Select label="" value={form.language} options={LANGS} onChange={v=>update('language',v)}/>
      </Section>

      <Section title="🎭 AI Uslubi">
        <Select label="" value={form.ai_style} options={STYLES} onChange={v=>update('ai_style',v)}/>
      </Section>

      <Section title="🎙️ Ovoz">
        <Select label="" value={form.tts_voice} options={VOICES} onChange={v=>update('tts_voice',v)}/>
      </Section>

      <Section title="🌡️ Ijodkorlik darajasi">
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'12px', color:'var(--text3)' }}>Aniq</span>
          <input type="range" min="0" max="1" step="0.1" value={form.temperature}
            onChange={e=>update('temperature',parseFloat(e.target.value))}
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