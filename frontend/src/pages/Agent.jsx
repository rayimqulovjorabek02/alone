// src/pages/Agent.jsx
import { useState }  from 'react'
import api           from '../api/client'
import toast         from 'react-hot-toast'
import { useLang }   from '../i18n/LanguageContext'
import AgentToolCard from '../components/agent/AgentToolCard'
import AgentResult   from '../components/agent/AgentResult'
import { Zap, Send, Clock } from 'lucide-react'


// ── Mavjud toollar ────────────────────────────────────────────
const ALL_TOOLS = ['search', 'calculate', 'translate']

// Tool nomlari va tavsiflari (tarjima bilan)
const TOOL_INFO = {
  search: {
    emoji: '🔍',
    label: { uz: 'Qidiruv',    ru: 'Поиск',      en: 'Search' },
    desc:  { uz: 'Veb qidiruv', ru: 'Веб-поиск',  en: 'Web search' },
  },
  calculate: {
    emoji: '🧮',
    label: { uz: 'Hisoblash',  ru: 'Вычисление',  en: 'Calculate' },
    desc:  { uz: 'Matematik',  ru: 'Математика',   en: 'Mathematics' },
  },
  translate: {
    emoji: '🌐',
    label: { uz: 'Tarjima',    ru: 'Перевод',      en: 'Translate' },
    desc:  { uz: 'Til tarjima',ru: 'Перевести',    en: 'Language translation' },
  },
}


export default function Agent() {
  const [query,   setQuery]   = useState('')
  const [tools,   setTools]   = useState(['search'])
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [history, setHistory] = useState([])
  const [focused, setFocused] = useState(false)
  const { t, lang }           = useLang()

  const toggleTool = (tool) => {
    setTools(prev =>
      prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    )
  }

  const handleRun = async () => {
    if (!query.trim())  return toast.error(t('required'))
    if (tools.length === 0) return toast.error(
      lang === 'uz' ? 'Kamida 1 ta tool tanlang' :
      lang === 'ru' ? 'Выберите хотя бы 1 инструмент' :
      'Select at least 1 tool'
    )
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/agent/run', { query, tools })
      setResult(data)
      setHistory(h => [{ query, result: data, time: new Date() }, ...h.slice(0, 9)])
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding:   '28px 24px',
      overflowY: 'auto',
      height:    '100%',
      maxWidth:  '720px',
      margin:    '0 auto',
    }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   'var(--r-md)',
            background:     'linear-gradient(135deg, #7c3aed, #6d28d9)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            boxShadow:      '0 4px 12px rgba(124,58,237,0.35)',
          }}>
            <Zap size={19} color="white" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            AI {t('agent')}
          </h1>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          { lang === 'uz' && 'Veb qidiruv, hisoblash, tarjima va boshqa toollar bilan murakkab savollarni yeching' }
          { lang === 'ru' && 'Решайте сложные задачи с помощью поиска, вычислений и перевода' }
          { lang === 'en' && 'Solve complex problems with web search, calculations, and translation' }
        </p>
      </div>

      {/* ── Tool tanlash ──────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize:      '12px',
          fontWeight:    700,
          color:         'var(--text3)',
          marginBottom:  '10px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          { lang === 'uz' ? 'Toollar' : lang === 'ru' ? 'Инструменты' : 'Tools' }
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_TOOLS.map(tool => {
            const info       = TOOL_INFO[tool]
            const isSelected = tools.includes(tool)
            return (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         '7px',
                  padding:     '8px 14px',
                  borderRadius:'var(--r-lg)',
                  border:      `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  cursor:      'pointer',
                  background:  isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                  color:       isSelected ? '#a78bfa' : 'var(--text3)',
                  fontSize:    '13px',
                  fontWeight:  isSelected ? 700 : 400,
                  fontFamily:  'var(--font)',
                  transition:  'all .15s',
                  boxShadow:   isSelected ? '0 0 0 2px var(--accent-glow)' : 'none',
                }}
              >
                <span>{info.emoji}</span>
                {info.label[lang] || info.label.uz}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Savol kiritish maydoni ────────────────────────────── */}
      <div style={{
        background:   'var(--surface)',
        border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-xl)',
        padding:      '14px',
        marginBottom: '14px',
        transition:   'border-color .2s, box-shadow .2s',
        boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
      }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleRun()
            }
          }}
          placeholder={
            lang === 'uz' ? "Masalan: Hozirgi dollar kursi necha? Yoki 234 * 67 ni hisoblа..." :
            lang === 'ru' ? "Например: Какой сейчас курс доллара? Или вычислите 234 * 67..." :
                            "E.g.: What is the current dollar rate? Or calculate 234 * 67..."
          }
          rows={3}
          style={{
            width:      '100%',
            background: 'none',
            border:     'none',
            color:      'var(--text)',
            fontSize:   '14px',
            resize:     'none',
            outline:    'none',
            lineHeight: 1.6,
            fontFamily: 'var(--font)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={handleRun}
            disabled={!query.trim() || loading}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '6px',
              padding:    '9px 20px',
              borderRadius:'var(--r-md)',
              border:     'none',
              cursor:     !query.trim() || loading ? 'not-allowed' : 'pointer',
              background: !query.trim() || loading ? 'var(--surface3)' : 'var(--accent)',
              color:      !query.trim() || loading ? 'var(--text3)' : 'white',
              fontSize:   '13px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              transition: 'all .15s',
              boxShadow:  !query.trim() || loading ? 'none' : '0 2px 8px var(--accent-glow)',
            }}
          >
            {loading ? (
              <>
                <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                { lang === 'uz' ? 'Ishlamoqda...' : lang === 'ru' ? 'Работает...' : 'Running...' }
              </>
            ) : (
              <>
                <Send size={14} />
                {t('send')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Loading animatsiyasi ──────────────────────────────── */}
      {loading && (
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '12px',
          padding:    '20px',
          color:      'var(--text3)',
          fontSize:   '14px',
          animation:  'fadeIn 0.2s var(--ease)',
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width:        7,
                  height:       7,
                  borderRadius: '50%',
                  background:   '#a78bfa',
                  animation:    `bounce 1.2s ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          { lang === 'uz' ? 'Agent ishlayapti...' : lang === 'ru' ? 'Агент работает...' : 'Agent is working...' }
        </div>
      )}

      {/* ── Natija ───────────────────────────────────────────── */}
      {result && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          <AgentResult result={result} />
        </div>
      )}

      {/* ── Tarix ────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           '6px',
            fontSize:      '12px',
            fontWeight:    700,
            color:         'var(--text3)',
            marginBottom:  '10px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <Clock size={13} />
            { lang === 'uz' ? "So'nggi so'rovlar" : lang === 'ru' ? 'Последние запросы' : 'Recent queries' }
          </div>
          {history.map((h, i) => (
            <div
              key={i}
              onClick={() => { setQuery(h.query); setResult(h.result) }}
              style={{
                padding:      '10px 14px',
                background:   'var(--surface)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                marginBottom: '6px',
                cursor:       'pointer',
                fontSize:     '13px',
                color:        'var(--text3)',
                transition:   'border-color .15s, background .15s',
                animation:    `fadeIn 0.3s var(--ease) ${i * 40}ms both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border2)'
                e.currentTarget.style.background  = 'var(--surface2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background  = 'var(--surface)'
              }}
            >
              <span style={{ color: 'var(--text2)' }}>
                {h.query.slice(0, 80)}
              </span>
              {h.query.length > 80 && '...'}
            </div>
          ))}
        </div>
      )}

      {/* Bounce animatsiya */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0) }
          40%           { transform: translateY(-7px) }
        }
      `}</style>
    </div>
  )
}