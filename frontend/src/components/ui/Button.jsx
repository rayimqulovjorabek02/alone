// src/components/ui/Button.jsx
export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, fullWidth = false, icon, loading = false, ...props
}) {
  const sizes = { sm:'7px 14px', md:'10px 20px', lg:'13px 28px' }
  const variants = {
    primary:  { background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'white', border:'none' },
    secondary:{ background:'var(--surface2)', color:'var(--text2)', border:'1px solid var(--border)' },
    danger:   { background:'rgba(248,113,113,.1)', color:'#f87171', border:'1px solid rgba(248,113,113,.3)' },
    ghost:    { background:'transparent', color:'var(--text2)', border:'1px solid var(--border)' },
  }
  const s = variants[variant] || variants.primary

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
      style={{
        padding:      sizes[size] || sizes.md,
        borderRadius: '10px',
        cursor:       disabled || loading ? 'not-allowed' : 'pointer',
        fontSize:     size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px',
        fontWeight:   600,
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '6px',
        width:        fullWidth ? '100%' : 'auto',
        justifyContent: fullWidth ? 'center' : 'flex-start',
        opacity:      disabled || loading ? 0.6 : 1,
        transition:   'opacity .15s, transform .1s',
        fontFamily:   'inherit',
        ...s,
        ...props.style,
      }}
    >
      {loading ? '⏳' : icon}
      {children}
    </button>
  )
}