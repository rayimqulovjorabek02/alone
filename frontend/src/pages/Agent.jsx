// src/pages/Agent.jsx
import { useState } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import AgentToolCard from '../components/agent/AgentToolCard'
import AgentResult from '../components/agent/AgentResult'
import { Zap, Send } from 'lucide-react'

const ALL_TOOLS = ['search', 'calculate', 'translate']

export default function Agent() {
  const [query,   setQuery]   = useState('')
  const [tools,   setTools]   = useState(['search'])
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [history, setHistory] = useState([])

  const toggleTool = (tool) => {
    setTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  const handleRun = async () => {
    if (!query.trim()) return toast.error("Savol kiriting")
    if (tools.length === 0) return toast.error("Kamida 1 ta tool tanlang")
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/agent/run', { query, tools })
      setResult(data)
      setHistory(h => [{ query, result: data, time: new Date() }, ...h.slice(0, 9)])
    } catch (e) {
      toast.error(e.response?.data?.detail || "Agent xato")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>AI Agent</h1>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          Veb qidiruv, hisoblash, tarjima va boshqa toollar bilan murakkab savollarni yeching
        </p>
      </div>

      {/* Tool tanlash */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', fontWeight: 600 }}>TOOLLAR</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_TOOLS.map(tool => (
            <AgentToolCard
              key={tool}
              tool={tool}
              active={tools.includes(tool)}
              onClick={() => toggleTool(tool)}
            />
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px', marginBottom: '14px' }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleRun())}
          placeholder="Masalan: Hozirgi dollar kursi necha? Yoki 234 * 67 ni hisoblа..."
          rows={3}
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text)', fontSize: '14px', resize: 'none', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={handleRun}
            disabled={!query.trim() || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'white', fontSize: '13px', fontWeight: 700, opacity: !query.trim() || loading ? 0.6 : 1 }}
          >
            <Send size={14} />
            {loading ? 'Ishlamoqda...' : 'Yuborish'}
          </button>
        </div>
      </div>

      {/* Natija */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', color: 'var(--text3)', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
            ))}
          </div>
          Agent ishlayapti...
        </div>
      )}
      {result && <AgentResult result={result} />}

      {/* Tarix */}
      {history.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600, marginBottom: '10px' }}>SO'NGGI SO'ROVLAR</div>
          {history.map((h, i) => (
            <div
              key={i}
              onClick={() => { setQuery(h.query); setResult(h.result) }}
              style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text3)' }}
            >
              <span style={{ color: 'var(--text2)' }}>{h.query.slice(0, 80)}</span>
              {h.query.length > 80 && '...'}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  )
}