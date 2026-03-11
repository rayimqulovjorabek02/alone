// src/pages/DevPanel.jsx — Dasturchi boshqaruv paneli
import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import toast from 'react-hot-toast'
import {
  Server, Database, Shield, Activity,
  Users, AlertTriangle, Trash2, RefreshCw,
  Ban, CheckCircle, Bell, ChevronDown, ChevronUp
} from 'lucide-react'

// ── Kichik komponentlar ───────────────────────────────────────

function StatCard({ label, value, sub, color = '#a78bfa', icon: Icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {Icon && <Icon size={16} style={{ color }} />}
        <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '26px', fontWeight: 900, color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

function Section({ title, icon: Icon, color = '#a78bfa', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '14px', overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={16} style={{ color }} />}
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'var(--text3)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text3)' }} />}
      </div>
      {open && <div style={{ padding: '16px 18px' }}>{children}</div>}
    </div>
  )
}

// ── Asosiy komponent ──────────────────────────────────────────

export default function DevPanel() {
  const [system,    setSystem]    = useState(null)
  const [dbStats,   setDbStats]   = useState(null)
  const [auditSum,  setAuditSum]  = useState(null)
  const [blacklist, setBlacklist] = useState([])
  const [users,     setUsers]     = useState([])
  const [apiStats,  setApiStats]  = useState(null)
  const [rateLim,   setRateLim]   = useState(null)
  const [auditLogs, setAuditLogs] = useState([])

  const [newIp,     setNewIp]     = useState('')
  const [newReason, setNewReason] = useState('')
  const [bcTitle,   setBcTitle]   = useState('')
  const [bcMsg,     setBcMsg]     = useState('')
  const [bcPlan,    setBcPlan]    = useState('')
  const [loading,   setLoading]   = useState({})
  const [search,    setSearch]    = useState('')

  const timerRef = useRef(null)

  useEffect(() => {
    loadAll()
    timerRef.current = setInterval(loadSystem, 10000)  // har 10s yangilash
    return () => clearInterval(timerRef.current)
  }, [])

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }))

  const loadAll = async () => {
    await Promise.allSettled([
      loadSystem(), loadDb(), loadAudit(),
      loadBlacklist(), loadUsers(), loadApiStats(), loadRateLim(), loadAuditLogs()
    ])
  }

  const loadSystem    = async () => { const r = await api.get('/api/dev/system');      setSystem(r.data) }
  const loadDb        = async () => { const r = await api.get('/api/dev/db/stats');    setDbStats(r.data) }
  const loadAudit     = async () => { const r = await api.get('/api/dev/audit/summary'); setAuditSum(r.data) }
  const loadBlacklist = async () => { const r = await api.get('/api/dev/blacklist');   setBlacklist(r.data) }
  const loadUsers     = async () => { const r = await api.get('/api/dev/users/detail'); setUsers(r.data.users || []) }
  const loadApiStats  = async () => { const r = await api.get('/api/dev/api-stats');   setApiStats(r.data) }
  const loadRateLim   = async () => { const r = await api.get('/api/dev/rate-limiter'); setRateLim(r.data) }
  const loadAuditLogs = async () => { const r = await api.get('/api/dev/audit?limit=30'); setAuditLogs(r.data.logs || []) }

  const vacuumDb = async () => {
    setLoad('vacuum', true)
    try {
      const { data } = await api.post('/api/dev/db/vacuum')
      toast.success(`DB tozalandi! ${data.saved_mb} MB bo'shadi`)
      loadDb()
    } finally { setLoad('vacuum', false) }
  }

  const blockIp = async () => {
    if (!newIp) return toast.error("IP kiriting")
    await api.post(`/api/dev/blacklist/${newIp}?reason=${encodeURIComponent(newReason || 'Manual')}`)
    toast.success(`${newIp} bloklandi`)
    setNewIp(''); setNewReason('')
    loadBlacklist()
  }

  const unblockIp = async (ip) => {
    await api.delete(`/api/dev/blacklist/${ip}`)
    toast.success(`${ip} blokdan chiqarildi`)
    loadBlacklist()
  }

  const broadcast = async () => {
    if (!bcTitle || !bcMsg) return toast.error("Sarlavha va xabar kerak")
    const { data } = await api.post(`/api/dev/broadcast?title=${encodeURIComponent(bcTitle)}&message=${encodeURIComponent(bcMsg)}&plan=${bcPlan}`)
    toast.success(`${data.sent_to} ta foydalanuvchiga yuborildi`)
    setBcTitle(''); setBcMsg('')
  }

  const filtered = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 24px', overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={22} style={{ color: '#f59e0b' }} /> Dev Admin Panel
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>Faqat dasturchlar uchun</p>
        </div>
        <button onClick={loadAll}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)', color: 'var(--text2)', fontSize: '12px' }}>
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {/* System stats */}
      {system && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <StatCard label="CPU" value={`${system.cpu_percent}%`} color="#f59e0b" icon={Activity} />
          <StatCard label="RAM" value={`${system.memory?.percent}%`} sub={`${system.memory?.used_mb} / ${system.memory?.total_mb} MB`} color="#60a5fa" icon={Server} />
          <StatCard label="Disk" value={`${system.disk?.percent}%`} sub={`${system.disk?.free_gb} GB bo'sh`} color="#34d399" icon={Database} />
          <StatCard label="Uptime" value={system.uptime_human} color="#a78bfa" icon={Activity} />
          <StatCard label="DB Hajmi" value={`${system.db_size_mb} MB`} color="#f87171" icon={Database} />
          <StatCard label="Python" value={system.python} color="#a78bfa" icon={Server} />
        </div>
      )}

      {/* Audit summary */}
      {auditSum && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <StatCard label="Jami amallar" value={auditSum.total}   color="#a78bfa" icon={Activity} />
          <StatCard label="Xatolar"      value={auditSum.failed}  color="#f87171" icon={AlertTriangle} />
          <StatCard label="Loginlar"     value={auditSum.logins}  color="#34d399" icon={Users} />
        </div>
      )}

      {/* DB */}
      <Section title="Ma'lumotlar bazasi" icon={Database} color="#60a5fa">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dbStats && Object.entries(dbStats.tables || {}).map(([t, c]) => (
              <div key={t} style={{ padding: '5px 12px', background: 'var(--surface2)', borderRadius: '8px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text3)' }}>{t}: </span>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>{c}</span>
              </div>
            ))}
          </div>
          <button onClick={vacuumDb} disabled={loading.vacuum}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: 'rgba(96,165,250,.1)', color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>
            <RefreshCw size={13} /> {loading.vacuum ? 'Tozalanmoqda...' : 'VACUUM'}
          </button>
        </div>
      </Section>

      {/* IP Blacklist */}
      <Section title="IP Blacklist" icon={Ban} color="#f87171">
        {/* Yangi IP qo'shish */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input value={newIp} onChange={e => setNewIp(e.target.value)}
            placeholder="192.168.1.1"
            style={{ padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '13px', outline: 'none', width: '150px' }} />
          <input value={newReason} onChange={e => setNewReason(e.target.value)}
            placeholder="Sabab"
            style={{ flex: 1, minWidth: '120px', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
          <button onClick={blockIp}
            style={{ padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: 'rgba(248,113,113,.15)', color: '#f87171', fontSize: '12px', fontWeight: 700 }}>
            + Bloklash
          </button>
        </div>

        {/* Bloklangan IPlar */}
        {(Array.isArray(blacklist) ? blacklist : blacklist.blacklist || []).slice(0, 20).map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface2)', borderRadius: '9px', marginBottom: '6px', fontSize: '12px' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#f87171', marginRight: '10px', fontFamily: 'monospace' }}>{item.ip}</span>
              <span style={{ color: 'var(--text3)' }}>{item.reason}</span>
            </div>
            <button onClick={() => unblockIp(item.ip)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', padding: '2px 8px' }}>
              <CheckCircle size={14} />
            </button>
          </div>
        ))}

        {(!blacklist || (Array.isArray(blacklist) ? blacklist : blacklist.blacklist || []).length === 0) && (
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Bloklangan IP yo'q</p>
        )}
      </Section>

      {/* Audit log */}
      <Section title="Audit Log" icon={Activity} color="#a78bfa">
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: 'var(--text3)', textAlign: 'left' }}>
                {['Vaqt', 'Amal', 'User', 'IP', 'Status'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp * 1000).toLocaleTimeString('uz-UZ')}
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 600, color: log.status === 'failed' ? '#f87171' : 'var(--text)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>{log.user_id || '—'}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)', fontFamily: 'monospace' }}>{log.ip || '—'}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      background: log.status === 'failed' ? 'rgba(248,113,113,.15)' : 'rgba(34,197,94,.1)',
                      color: log.status === 'failed' ? '#f87171' : '#22c55e' }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Foydalanuvchilar */}
      <Section title={`Foydalanuvchilar (${users.length})`} icon={Users} color="#34d399">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Qidirish..."
          style={{ width: '100%', maxWidth: '300px', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '13px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />

        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: 'var(--text3)' }}>
                {['ID', 'Username', 'Email', 'Plan', 'Sessiyalar', 'Xabarlar', 'Holat'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>{u.id}</td>
                  <td style={{ padding: '6px 10px', fontWeight: 600 }}>
                    {u.username}
                    {u.is_admin ? <span style={{ color: '#f59e0b', fontSize: '10px', marginLeft: '4px' }}>ADMIN</span> : null}
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>{u.email}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      background: u.plan === 'premium' ? 'rgba(245,158,11,.15)' : u.plan === 'pro' ? 'rgba(167,139,250,.1)' : 'rgba(255,255,255,.06)',
                      color: u.plan === 'premium' ? '#f59e0b' : u.plan === 'pro' ? '#a78bfa' : 'var(--text3)' }}>
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>{u.session_count}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text3)' }}>{u.msg_count}</td>
                  <td style={{ padding: '6px 10px' }}>
                    <span style={{ fontSize: '10px', color: u.is_active ? '#22c55e' : '#f87171' }}>
                      {u.is_active ? '● Faol' : '● Bloklangan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Broadcast */}
      <Section title="Bildirishnoma yuborish" icon={Bell} color="#f59e0b" defaultOpen={false}>
        <div style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
          <input value={bcTitle} onChange={e => setBcTitle(e.target.value)}
            placeholder="Sarlavha"
            style={{ padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} />
          <textarea value={bcMsg} onChange={e => setBcMsg(e.target.value)}
            placeholder="Xabar matni..." rows={3}
            style={{ padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={bcPlan} onChange={e => setBcPlan(e.target.value)}
              style={{ padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text2)', fontSize: '12px', cursor: 'pointer' }}>
              <option value="">Barcha foydalanuvchilar</option>
              <option value="free">Bepul</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
            <button onClick={broadcast}
              style={{ padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: 'rgba(245,158,11,.15)', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
              Yuborish
            </button>
          </div>
        </div>
      </Section>

      {/* API Stats */}
      {apiStats && (
        <Section title="API Statistika" icon={Activity} color="#60a5fa" defaultOpen={false}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <StatCard label="Jami so'rov"  value={apiStats.total}                color="#a78bfa" />
            <StatCard label="Xatolar"      value={Object.values(apiStats.errors || {}).reduce((a, b) => a + b, 0)} color="#f87171" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Object.entries(apiStats.requests || {}).sort(([, a], [, b]) => b - a).slice(0, 15).map(([k, v]) => (
              <div key={k} style={{ padding: '4px 10px', background: 'var(--surface2)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--text3)' }}>
                {k}: <b style={{ color: '#a78bfa' }}>{v}</b>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  )
}