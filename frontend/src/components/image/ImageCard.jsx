// src/components/image/ImageCard.jsx
import { useState } from 'react'
import { Download, Copy, Trash2, ZoomIn } from 'lucide-react'
import { Modal } from '../ui'

export function ImageCard({ image, onDelete }) {
  const [zoom, setZoom] = useState(false)

  const download = () => {
    const a = document.createElement('a')
    a.href = image.url
    a.download = `alone-ai-${Date.now()}.png`
    a.click()
  }

  const copyPrompt = () => navigator.clipboard.writeText(image.prompt)

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', overflow: 'hidden',
        transition: 'all .25s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.border = '1px solid rgba(102,51,238,.3)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.border = '1px solid var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '75%', background: 'var(--bg2)' }}>
          <img
            src={image.url}
            alt={image.prompt}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', cursor: 'zoom-in',
            }}
            onClick={() => setZoom(true)}
          />
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            display: 'flex', gap: '4px',
          }}>
            <button onClick={() => setZoom(true)} style={{
              background: 'rgba(0,0,0,.6)', border: 'none', color: 'white',
              cursor: 'pointer', padding: '5px', borderRadius: '6px',
            }}><ZoomIn size={13} /></button>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '12px 14px' }}>
          <p style={{
            fontSize: '12px', color: 'var(--text2)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: '10px',
          }}>{image.prompt}</p>

          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button onClick={copyPrompt} title="Promptni nusxalash" style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              cursor: 'pointer', padding: '4px', borderRadius: '5px',
            }}><Copy size={12} /></button>
            <button onClick={download} title="Yuklab olish" style={{
              background: 'rgba(102,51,238,.1)', border: '1px solid rgba(102,51,238,.2)',
              color: '#a78bfa', cursor: 'pointer', padding: '4px 8px',
              borderRadius: '6px', fontSize: '12px', fontFamily: 'Sora, sans-serif',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}><Download size={11} /> Yuklab olish</button>
            {onDelete && (
              <button onClick={() => onDelete(image.id)} style={{
                background: 'none', border: 'none', color: 'var(--text3)',
                cursor: 'pointer', padding: '4px', borderRadius: '5px',
              }}><Trash2 size={12} /></button>
            )}
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      <Modal isOpen={zoom} onClose={() => setZoom(false)} size="xl">
        <img src={image.url} alt={image.prompt} style={{ width: '100%', borderRadius: '10px' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>
          {image.prompt}
        </p>
      </Modal>
    </>
  )
}


// ── IMAGE GENERATOR FORM ──────────────────────
export function ImageGeneratorForm({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('')
  const [style,  setStyle]  = useState('realistic')
  const [size,   setSize]   = useState('1024x1024')

  const STYLES = [
    { value: 'realistic', label: '📸 Realistik' },
    { value: 'anime',     label: '🎌 Anime' },
    { value: 'art',       label: '🎨 San\'at' },
    { value: 'cartoon',   label: '🎭 Cartoon' },
    { value: 'sketch',    label: '✏️ Eskiz' },
    { value: 'cinematic', label: '🎬 Kinematik' },
  ]

  const SIZES = [
    { value: '512x512',   label: '512 × 512' },
    { value: '1024x1024', label: '1024 × 1024' },
    { value: '1024x768',  label: '1024 × 768' },
    { value: '768x1024',  label: '768 × 1024' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    onGenerate({ prompt, style, size })
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px',
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
        🖼️ Rasm yaratish
      </h3>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Rasmni tasvirlang... (ingliz tilida yozish tavsiya etiladi)"
        rows={3}
        style={{
          width: '100%', background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(120,80,255,.2)', borderRadius: '12px',
          color: 'var(--text)', padding: '12px 14px', fontSize: '14px',
          fontFamily: 'Sora, sans-serif', outline: 'none', resize: 'vertical',
          marginBottom: '14px', minHeight: '80px',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,.55)'}
        onBlur={e  => e.target.style.borderColor = 'rgba(120,80,255,.2)'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            USLUB
          </label>
          <select value={style} onChange={e => setStyle(e.target.value)} style={{
            width: '100%', background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(120,80,255,.2)', borderRadius: '10px',
            color: 'var(--text)', padding: '9px 12px', fontSize: '13px', outline: 'none',
          }}>
            {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            O'LCHAM
          </label>
          <select value={size} onChange={e => setSize(e.target.value)} style={{
            width: '100%', background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(120,80,255,.2)', borderRadius: '10px',
            color: 'var(--text)', padding: '9px 12px', fontSize: '13px', outline: 'none',
          }}>
            {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" disabled={!prompt.trim() || loading} style={{
        width: '100%', padding: '12px',
        background: loading || !prompt.trim()
          ? 'rgba(102,51,238,.3)'
          : 'linear-gradient(135deg, #6633ee, #4f46e5)',
        border: 'none', borderRadius: '12px', color: 'white',
        fontWeight: 700, fontSize: '15px', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
        fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px',
      }}>
        {loading ? (
          <><div className="spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Yaratilmoqda...</>
        ) : '🪄 Rasm yaratish'}
      </button>
    </form>
  )
}
