// src/components/ui/Modal.jsx
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, width = '480px' }) {
  useEffect(() => {
    const handle = (e) => e.key === 'Escape' && onClose?.()
    if (open) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position:       'fixed', inset: 0, zIndex: 1000,
        background:     'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        padding:        '20px',
      }}
    >
      <div style={{
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: '20px',
        width:        '100%',
        maxWidth:     width,
        maxHeight:    '90vh',
        overflowY:    'auto',
        animation:    'modalIn .2s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:700 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', padding:'4px', borderRadius:'8px' }}>
            <X size={18}/>
          </button>
        </div>
        {/* Body */}
        <div style={{ padding:'20px' }}>{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}