// src/components/agent/AgentToolCard.jsx
export default function AgentToolCard({ tool, active, onClick }) {
  const ICONS = { search:'🔍', calculate:'🧮', translate:'🌍', weather:'🌤️', code:'💻', wiki:'📚' }

  return (
    <div onClick={onClick} style={{
      padding:    '10px 14px',
      borderRadius:'12px',
      border:     `1px solid ${active?'var(--accent)':'var(--border)'}`,
      cursor:     'pointer',
      background: active ? 'rgba(124,58,237,.1)' : 'var(--surface2)',
      display:    'flex',
      alignItems: 'center',
      gap:        '8px',
      fontSize:   '13px',
      fontWeight: active ? 700 : 400,
      color:      active ? '#a78bfa' : 'var(--text3)',
      transition: 'all .15s',
    }}>
      <span style={{ fontSize:'16px' }}>{ICONS[tool] || '⚙️'}</span>
      {tool}
    </div>
  )
}