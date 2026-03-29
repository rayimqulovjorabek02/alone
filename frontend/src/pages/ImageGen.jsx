// src/pages/ImageGen.jsx
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useLang }             from '../i18n/LanguageContext'
import { Sparkles, Download, Trash2, Clock, Image as ImageIcon } from 'lucide-react'

const STYLES = [
  { value: 'realistic', label: { uz: 'Realistik',  ru: 'Реалистичный', en: 'Realistic'  } },
  { value: 'anime',     label: { uz: 'Anime',       ru: 'Аниме',        en: 'Anime'       } },
  { value: 'art',       label: { uz: 'San\'at',     ru: 'Искусство',    en: 'Art'         } },
  { value: 'cartoon',   label: { uz: 'Multfilm',    ru: 'Мультфильм',   en: 'Cartoon'     } },
  { value: 'sketch',    label: { uz: 'Eskiz',       ru: 'Эскиз',        en: 'Sketch'      } },
  { value: 'cinematic', label: { uz: 'Kinematik',   ru: 'Кино',         en: 'Cinematic'   } },
  { value: '3d',        label: { uz: '3D',           ru: '3D',           en: '3D'          } },
  { value: 'watercolor',label: { uz: 'Akvarel',     ru: 'Акварель',     en: 'Watercolor'  } },
  { value: 'oil',       label: { uz: 'Moy bo\'yoq', ru: 'Масло',        en: 'Oil paint'   } },
  { value: 'pixel',     label: { uz: 'Piksel',      ru: 'Пиксель',      en: 'Pixel'       } },
]

export default function ImageGen() {
  const navigate              = useNavigate()
  const [prompt,         setPrompt]         = useState('')
  const [style,          setStyle]          = useState('realistic')
  const [loading,        setLoading]        = useState(false)
  const [result,         setResult]         = useState(null)
  const [history,        setHistory]        = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [focused,        setFocused]        = useState(false)
  const [tab,            setTab]            = useState('generate')
  const { t, lang }                         = useLang()

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/api/image/history')
      setHistory(data || [])
    } catch {}
    finally { setHistoryLoading(false) }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error(t('required'))
    setLoading(true)
    try {
      const { data } = await api.post('/api/image/generate', { prompt, style })
      setResult(data)
      loadHistory()
      toast.success(
        lang === 'uz' ? 'Rasm yaratildi!' :
        lang === 'ru' ? 'Изображение создано!' :
                        'Image created!'
      )
    } catch (e) {
      if (e.response?.status === 429) {
        toast.error(
          lang === 'uz' ? 'Kunlik limit tugadi! Premium ga o\'ting' :
          lang === 'ru' ? 'Дневной лимит исчерпан! Перейдите на Premium' :
                          'Daily limit reached! Upgrade to Premium',
          {
            duration: 5000,
            icon: '👑',
          }
        )
        setTimeout(() => navigate('/premium'), 2000)
      } else {
        toast.error(e.response?.data?.detail || t('error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (image_b64) => {
    const a    = document.createElement('a')
    a.href     = `data:image/png;base64,${image_b64}`
    a.download = `alone-ai-${Date.now()}.png`
    a.click()
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/image/history/${id}`)
      setHistory(h => h.filter(i => i.id !== id))
      toast.success(t('success'))
    } catch {
      toast.error(t('error'))
    }
  }

  const formatDate = (ts) => {
    const d = new Date(ts * 1000)
    return d.toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ',
      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    )
  }

  return (
    <div style={{ padding: '28px 24px', overflowY: 'auto', height: '100%', maxWidth: '760px', margin: '0 auto' }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={19} style={{ color: '#f59e0b' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            { lang === 'uz' ? 'Rasm Generatsiya' : lang === 'ru' ? 'Генерация изображений' : 'Image Generation' }
          </h1>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          { lang === 'uz' ? 'Tasvirlaringizni matn orqali yarating' :
            lang === 'ru' ? 'Создавайте изображения с помощью текста' :
                            'Create images with text descriptions' }
        </p>
      </div>

      {/* ── Tablar ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          {
            key:   'generate',
            icon:  <Sparkles size={14}/>,
            label: lang === 'uz' ? 'Yaratish' : lang === 'ru' ? 'Создать' : 'Create',
          },
          {
            key:   'history',
            icon:  <Clock size={14}/>,
            label: lang === 'uz' ? `Tarix (${history.length})` :
                   lang === 'ru' ? `История (${history.length})` :
                                   `History (${history.length})`,
          },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '6px',
              padding:    '8px 16px',
              borderRadius:'var(--r-lg)',
              border:     `1px solid ${tab === key ? 'var(--accent)' : 'var(--border)'}`,
              background: tab === key ? 'var(--accent-soft)' : 'var(--surface)',
              color:      tab === key ? '#a78bfa' : 'var(--text3)',
              fontSize:   '13px',
              fontWeight: tab === key ? 700 : 400,
              cursor:     'pointer',
              fontFamily: 'var(--font)',
              transition: 'all .15s',
            }}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── Yaratish tab ─────────────────────────────────────── */}
      {tab === 'generate' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>

          {/* Prompt */}
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              lang === 'uz' ? "Masalan: tog'lar orasida kechqurun, rangli osmonda yulduzlar..." :
              lang === 'ru' ? "Например: вечер в горах, звёзды на цветном небе..." :
                              "E.g: evening in the mountains, stars on a colorful sky..."
            }
            rows={3}
            style={{
              width:        '100%',
              padding:      '14px',
              background:   'var(--surface)',
              border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--r-xl)',
              color:        'var(--text)',
              fontSize:     '14px',
              resize:       'vertical',
              outline:      'none',
              fontFamily:   'var(--font)',
              marginBottom: '14px',
              boxSizing:    'border-box',
              lineHeight:   1.6,
              transition:   'border-color .2s, box-shadow .2s',
              boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
            }}
          />

          {/* Uslublar */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize:      '12px',
              fontWeight:    600,
              color:         'var(--text3)',
              display:       'block',
              marginBottom:  '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}>
              {t('style')}
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  style={{
                    padding:      '6px 14px',
                    borderRadius: '100px',
                    border:       `1px solid ${style === s.value ? 'var(--accent)' : 'var(--border)'}`,
                    cursor:       'pointer',
                    fontSize:     '12px',
                    fontWeight:   style === s.value ? 700 : 400,
                    background:   style === s.value ? 'rgba(124,58,237,.15)' : 'var(--surface)',
                    color:        style === s.value ? '#a78bfa' : 'var(--text3)',
                    fontFamily:   'var(--font)',
                    transition:   'all .15s',
                  }}
                >
                  {s.label[lang] || s.label.uz}
                </button>
              ))}
            </div>
          </div>

          {/* Yaratish tugmasi */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              width:          '100%',
              padding:        '13px',
              borderRadius:   'var(--r-lg)',
              border:         'none',
              cursor:         loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              background:     loading || !prompt.trim()
                ? 'var(--surface3)'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color:          loading || !prompt.trim() ? 'var(--text3)' : 'white',
              fontSize:       '14px',
              fontWeight:     700,
              fontFamily:     'var(--font)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              transition:     'all .2s',
              boxShadow:      loading || !prompt.trim()
                ? 'none'
                : '0 4px 16px rgba(124,58,237,0.35)',
              marginBottom:   '24px',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width:          16,
                  height:         16,
                  border:         '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius:   '50%',
                  display:        'inline-block',
                  animation:      'spin 0.8s linear infinite',
                }} />
                { lang === 'uz' ? 'Yaratilmoqda...' : lang === 'ru' ? 'Создаётся...' : 'Generating...' }
              </>
            ) : (
              <>
                <Sparkles size={16} />
                { lang === 'uz' ? 'Rasm yaratish' : lang === 'ru' ? 'Создать изображение' : 'Generate image' }
              </>
            )}
          </button>

          {/* Natija */}
          {result?.image_b64 && (
            <div style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              overflow:     'hidden',
              animation:    'fadeIn 0.4s var(--ease)',
            }}>
              <img
                src={`data:image/png;base64,${result.image_b64}`}
                alt="Generated"
                style={{ width: '100%', display: 'block' }}
              />
              <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{result.engine}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                    {result.usage}/{result.limit} { lang === 'uz' ? 'bugun' : lang === 'ru' ? 'сегодня' : 'today' }
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(result.image_b64)}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '6px',
                    padding:    '8px 14px',
                    borderRadius:'var(--r-lg)',
                    border:     '1px solid var(--border)',
                    cursor:     'pointer',
                    background: 'var(--surface2)',
                    color:      'var(--text2)',
                    fontSize:   '12px',
                    fontFamily: 'var(--font)',
                    transition: 'all .15s',
                  }}
                >
                  <Download size={14} />
                  {t('downloadImage')}
                </button>
              </div>
            </div>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ── Tarix tab ────────────────────────────────────────── */}
      {tab === 'history' && (
        <div style={{ animation: 'fadeIn 0.3s var(--ease)' }}>
          {historyLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--r-xl)' }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <ImageIcon size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                { lang === 'uz' ? "Hali rasm yo'q" : lang === 'ru' ? 'Изображений пока нет' : 'No images yet' }
              </div>
              <div style={{ fontSize: '13px' }}>
                { lang === 'uz' ? 'Birinchi rasmingizni yarating!' :
                  lang === 'ru' ? 'Создайте своё первое изображение!' :
                                  'Create your first image!' }
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {history.map(item => (
                <div
                  key={item.id}
                  style={{
                    background:   'var(--surface)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--r-xl)',
                    overflow:     'hidden',
                    transition:   'transform .2s, border-color .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform   = 'translateY(-2px)'
                    e.currentTarget.style.borderColor = 'var(--border2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform   = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {item.image_b64 ? (
                    <img
                      src={`data:image/png;base64,${item.image_b64}`}
                      alt={item.prompt}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={32} style={{ opacity: 0.3 }} />
                    </div>
                  )}

                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.prompt}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text3)', background: 'var(--surface2)', padding: '2px 7px', borderRadius: '100px' }}>
                        {item.style || item.model}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {item.image_b64 && (
                          <button
                            onClick={() => handleDownload(item.image_b64)}
                            title={t('downloadImage')}
                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', borderRadius: 'var(--r-sm)', transition: 'all .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)' }}
                          >
                            <Download size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          title={t('delete')}
                          style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', borderRadius: 'var(--r-sm)', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-soft)'; e.currentTarget.style.color = 'var(--error)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}