// src/components/settings/LanguageSelector.jsx
const LANGS = [
  { code:'uz', flag:'🇺🇿', name:"O'zbek" },
  { code:'ru', flag:'🇷🇺', name:'Русский' },
  { code:'en', flag:'🇬🇧', name:'English' },
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:'8px' }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={()=>onChange(l.code)}
          style={{
            padding:    '8px 16px',
            borderRadius:'10px',
            border:     `1px solid ${value===l.code?'var(--accent)':'var(--border)'}`,
            cursor:     'pointer',
            background: value===l.code ? 'rgba(124,58,237,.1)' : 'var(--bg)',
            color:      value===l.code ? '#a78bfa' : 'var(--text3)',
            fontSize:   '13px',
            fontWeight: value===l.code ? 700 : 400,
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
          }}>
          <span>{l.flag}</span>
          <span>{l.name}</span>
        </button>
      ))}
    </div>
  )
}