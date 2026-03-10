// src/components/agent/AgentResult.jsx
export default function AgentResult({ result }) {
  if (!result) return null

  return (
    <div style={{ marginTop:'16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' }}>
      {result.search_result && (
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'rgba(96,165,250,.05)' }}>
          <div style={{ fontSize:'11px', color:'#60a5fa', fontWeight:700, marginBottom:'6px' }}>🔍 Veb qidiruv</div>
          <p style={{ fontSize:'13px', color:'var(--text3)', margin:0, lineHeight:1.6 }}>{result.search_result}</p>
        </div>
      )}
      <div style={{ padding:'16px' }}>
        <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'8px' }}>
          Ishlatilgan vositalar: {result.tools_used?.join(', ') || 'yo\'q'}
        </div>
        <p style={{ fontSize:'14px', color:'var(--text)', lineHeight:1.7, margin:0, whiteSpace:'pre-wrap' }}>{result.answer}</p>
      </div>
    </div>
  )
}