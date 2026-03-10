// src/components/settings/SettingsSection.jsx
export default function SettingsSection({ title, description, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'16px', padding:'20px', marginBottom:'14px' }}>
      <div style={{ marginBottom:'16px' }}>
        <h3 style={{ fontSize:'14px', fontWeight:700, color:'var(--text)' }}>{title}</h3>
        {description && <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'3px' }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}