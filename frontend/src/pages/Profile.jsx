// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react'
import api                     from '../api/client'
import toast                   from 'react-hot-toast'
import { useAuthStore }        from '../store/authStore'
import { useLang }             from '../i18n/LanguageContext'
import { Save, Lock, Brain, Trash2, X, Eye, EyeOff, User, Mail, Shield } from 'lucide-react'

// ── Avatar lug'ati ────────────────────────────────────────────
const AVATARS = [
  { key: 'bot',    emoji: '🤖' },
  { key: 'cat',    emoji: '🐱' },
  { key: 'fox',    emoji: '🦊' },
  { key: 'robot',  emoji: '🦾' },
  { key: 'alien',  emoji: '👽' },
  { key: 'wizard', emoji: '🧙' },
]

// ── Plan rang stili ───────────────────────────────────────────
const PLAN_STYLE = {
  free:    { color: 'var(--text3)', bg: 'var(--surface3)' },
  pro:     { color: '#a78bfa',      bg: 'rgba(167,139,250,0.12)' },
  premium: { color: '#fcd34d',      bg: 'rgba(245,158,11,0.12)' },
}


// ── Bo'lim komponenti ─────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div style={{
      background:   'var(--surface)',
      border:       '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding:      '22px',
      marginBottom: '14px',
      animation:    'fadeIn 0.3s var(--ease)',
    }}>
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        marginBottom:'18px',
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   'var(--r-md)',
          background:     'var(--surface2)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: 'var(--text3)' }} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}


// ── Input komponenti ──────────────────────────────────────────
function InputField({ label, value, onChange, type = 'text', placeholder, rightEl }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        fontSize:      '12px',
        fontWeight:    600,
        color:         'var(--text3)',
        display:       'block',
        marginBottom:  '6px',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:        '100%',
            padding:      rightEl ? '11px 44px 11px 14px' : '11px 14px',
            background:   'var(--bg)',
            border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            color:        'var(--text)',
            fontSize:     '14px',
            outline:      'none',
            boxSizing:    'border-box',
            transition:   'border-color .2s, box-shadow .2s',
            boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
          }}
        />
        {rightEl && (
          <div style={{
            position:  'absolute',
            right:     '12px',
            top:       '50%',
            transform: 'translateY(-50%)',
          }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  )
}


export default function Profile() {
  const { user, fetchUser }    = useAuthStore()
  const { t, lang }            = useLang()
  const [form,        setForm]       = useState({ username: '', avatar: 'bot' })
  const [memory,      setMemory]     = useState({})
  const [oldPwd,      setOldPwd]     = useState('')
  const [newPwd,      setNewPwd]     = useState('')
  const [showOld,     setShowOld]    = useState(false)
  const [showNew,     setShowNew]    = useState(false)
  const [saving,      setSaving]     = useState(false)
  const [pwdSaving,   setPwdSaving]  = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (user) setForm({ username: user.username, avatar: user.avatar || 'bot' })
    api.get('/api/profile/memory').then(r => setMemory(r.data || {})).catch(() => {})
  }, [user])

  // ── Avatar yuklash ────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error(
      lang === 'ru' ? 'Только изображения' : lang === 'en' ? 'Images only' : 'Faqat rasm'
    )
    if (file.size > 2 * 1024 * 1024) return toast.error(
      lang === 'ru' ? 'Максимум 2MB' : lang === 'en' ? 'Max 2MB' : 'Max 2MB'
    )
    setAvatarUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/api/profile/avatar', form)
      setForm(f => ({ ...f, avatar: data.avatar }))
      await fetchUser()
      toast.success(lang === 'ru' ? 'Фото обновлено!' : lang === 'en' ? 'Photo updated!' : 'Rasm yangilandi!')
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  // ── Profil saqlash ────────────────────────────────────────
  const saveProfile = async () => {
    if (!form.username.trim()) return toast.error(t('required'))
    setSaving(true)
    try {
      await api.put('/api/profile', form)
      await fetchUser()
      toast.success(t('success') + ' ✓')
    } catch {
      toast.error(t('error'))
    } finally {
      setSaving(false)
    }
  }

  // ── Parol o'zgartirish ────────────────────────────────────
  const changePassword = async () => {
    if (!oldPwd || !newPwd) return toast.error(t('required'))
    if (newPwd.length < 8)  return toast.error(t('passwordTooShort'))
    if (!/[0-9]/.test(newPwd)) return toast.error(t('passwordNeedsNumber'))
    setPwdSaving(true)
    try {
      await api.post('/api/auth/change-password', {
        old_password: oldPwd,
        new_password: newPwd,
      })
      toast.success(t('success') + ' ✓')
      setOldPwd('')
      setNewPwd('')
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setPwdSaving(false)
    }
  }

  // ── Xotira o'chirish ──────────────────────────────────────
  const deleteMemoryKey = async (key) => {
    try {
      await api.delete(`/api/profile/memory/${key}`)
      setMemory(m => { const n = { ...m }; delete n[key]; return n })
    } catch {
      toast.error(t('error'))
    }
  }

  const clearMemory = async () => {
    try {
      await api.delete('/api/profile/memory')
      setMemory({})
      toast.success(t('clearMemory'))
    } catch {
      toast.error(t('error'))
    }
  }

  const planStyle  = PLAN_STYLE[user?.plan] || PLAN_STYLE.free
  const avatar     = AVATARS.find(a => a.key === form.avatar) || AVATARS[0]
  const memKeys    = Object.keys(memory)

  return (
    <div style={{
      padding:   '28px 24px',
      overflowY: 'auto',
      height:    '100%',
      maxWidth:  '600px',
      margin:    '0 auto',
    }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
          {t('profile')}
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: '13px', marginTop: '4px' }}>
          {t('profileInfo')}
        </p>
      </div>

      {/* ── Foydalanuvchi kartasi ─────────────────────────────── */}
      <div style={{
        background:   'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.08))',
        border:       '1px solid rgba(124,58,237,0.2)',
        borderRadius: 'var(--r-xl)',
        padding:      '22px',
        marginBottom: '14px',
        display:      'flex',
        alignItems:   'center',
        gap:          '16px',
        animation:    'fadeIn 0.3s var(--ease)',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width:          72,
            height:         72,
            borderRadius:   '20px',
            background:     'rgba(124,58,237,0.2)',
            border:         '2px solid rgba(124,58,237,0.3)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '36px',
            overflow:       'hidden',
          }}>
            {form.avatar?.startsWith('data:image') ? (
              <img src={form.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              avatar.emoji
            )}
          </div>
          {/* Kamera tugmasi */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            title={lang === 'ru' ? 'Загрузить фото' : lang === 'en' ? 'Upload photo' : 'Rasm yuklash'}
            style={{
              position:       'absolute',
              bottom:         -6,
              right:          -6,
              width:          26,
              height:         26,
              borderRadius:   '50%',
              background:     'var(--accent)',
              border:         '2px solid var(--bg)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         avatarUploading ? 'wait' : 'pointer',
              fontSize:       '12px',
            }}
          >
            {avatarUploading ? '⏳' : '📷'}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            {user?.username}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text3)' }}>
              <Mail size={12} />
              {user?.email}
            </div>
            <span style={{ color: 'var(--border2)' }}>•</span>
            <span style={{
              fontSize:      '11px',
              fontWeight:    700,
              padding:       '2px 8px',
              borderRadius:  '100px',
              background:    planStyle.bg,
              color:         planStyle.color,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              {t(user?.plan) || user?.plan}
            </span>
            {user?.is_admin && (
              <span style={{
                display:       'flex',
                alignItems:    'center',
                gap:           '3px',
                fontSize:      '11px',
                fontWeight:    700,
                padding:       '2px 8px',
                borderRadius:  '100px',
                background:    'rgba(245,158,11,0.12)',
                color:         '#f59e0b',
                textTransform: 'uppercase',
              }}>
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Profil tahrirlash ─────────────────────────────────── */}
      <Section title={t('profileInfo')} icon={User}>
        <InputField
          label={t('username')}
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          placeholder="misol_user"
        />

        {/* Avatar tanlash */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{
            fontSize:      '12px',
            fontWeight:    600,
            color:         'var(--text3)',
            display:       'block',
            marginBottom:  '10px',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
          }}>
            {t('chooseAvatar')}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Rasm yuklash tugmasi */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              style={{
                width:        48,
                height:       48,
                borderRadius: 'var(--r-lg)',
                border:       `2px dashed ${form.avatar?.startsWith('data:image') ? 'var(--accent)' : 'var(--border)'}`,
                background:   form.avatar?.startsWith('data:image') ? 'var(--accent-soft)' : 'var(--bg)',
                cursor:       avatarUploading ? 'wait' : 'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent:'center',
                fontSize:     '20px',
                overflow:     'hidden',
                transition:   'all .15s',
              }}
              title={lang === 'ru' ? 'Загрузить своё фото' : lang === 'en' ? 'Upload your photo' : "O'z rasmingizni yuklash"}
            >
              {form.avatar?.startsWith('data:image')
                ? <img src={form.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '📷'
              }
            </button>
            {AVATARS.map(({ key, emoji }) => (
              <button
                key={key}
                onClick={() => setForm(f => ({ ...f, avatar: key }))}
                style={{
                  width:        48,
                  height:       48,
                  borderRadius: 'var(--r-lg)',
                  border:       `2px solid ${form.avatar === key ? 'var(--accent)' : 'var(--border)'}`,
                  background:   form.avatar === key ? 'var(--accent-soft)' : 'var(--bg)',
                  fontSize:     '22px',
                  cursor:       'pointer',
                  transition:   'all .15s',
                  boxShadow:    form.avatar === key ? '0 0 0 2px var(--accent-glow)' : 'none',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Saqlash tugmasi */}
        <button
          onClick={saveProfile}
          disabled={saving}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '7px',
            padding:     '10px 20px',
            borderRadius:'var(--r-lg)',
            border:      'none',
            cursor:      saving ? 'not-allowed' : 'pointer',
            background:  saving ? 'var(--surface3)' : 'var(--accent)',
            color:       saving ? 'var(--text3)' : 'white',
            fontSize:    '13px',
            fontWeight:  700,
            fontFamily:  'var(--font)',
            transition:  'all .2s',
            boxShadow:   saving ? 'none' : '0 2px 8px var(--accent-glow)',
          }}
        >
          {saving ? (
            <>
              <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
              {t('loading')}
            </>
          ) : (
            <>
              <Save size={14} />
              {t('save')}
            </>
          )}
        </button>
      </Section>

      {/* ── Parol o'zgartirish ────────────────────────────────── */}
      <Section title={t('changePassword')} icon={Lock}>
        <InputField
          label={
            { uz: 'Joriy parol', ru: 'Текущий пароль', en: 'Current password' }[lang] || 'Joriy parol'
          }
          value={oldPwd}
          onChange={e => setOldPwd(e.target.value)}
          type={showOld ? 'text' : 'password'}
          placeholder="••••••••"
          rightEl={
            <button
              onClick={() => setShowOld(!showOld)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}
            >
              {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <InputField
          label={t('newPassword')}
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
          type={showNew ? 'text' : 'password'}
          placeholder="••••••••"
          rightEl={
            <button
              onClick={() => setShowNew(!showNew)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <button
          onClick={changePassword}
          disabled={pwdSaving || !oldPwd || !newPwd}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '7px',
            padding:     '10px 20px',
            borderRadius:'var(--r-lg)',
            border:      'none',
            cursor:      pwdSaving || !oldPwd || !newPwd ? 'not-allowed' : 'pointer',
            background:  pwdSaving || !oldPwd || !newPwd ? 'var(--surface3)' : 'var(--surface2)',
            color:       pwdSaving || !oldPwd || !newPwd ? 'var(--text3)' : 'var(--text)',
            fontSize:    '13px',
            fontWeight:  700,
            fontFamily:  'var(--font)',
            transition:  'all .2s',
          }}
        >
          {pwdSaving ? (
            <>
              <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--text)', borderRadius: '50%', display: 'inline-block' }} />
              {t('loading')}
            </>
          ) : (
            <>
              <Lock size={14} />
              {t('changePassword')}
            </>
          )}
        </button>
      </Section>

      {/* ── AI Xotira ─────────────────────────────────────────── */}
      <Section title={`${t('aiMemory')} (${memKeys.length})`} icon={Brain}>
        {memKeys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧠</div>
            <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
              {t('memoryHint')}
            </p>
          </div>
        ) : (
          <>
            {/* Xotira elementlari */}
            <div style={{ marginBottom: '12px' }}>
              {Object.entries(memory).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '10px 12px',
                    borderRadius:   'var(--r-md)',
                    background:     'var(--surface2)',
                    marginBottom:   '6px',
                    gap:            '10px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize:      '11px',
                      color:         '#a78bfa',
                      fontWeight:    700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}>
                      {k}
                    </span>
                    <div style={{
                      fontSize:     '13px',
                      color:        'var(--text2)',
                      marginTop:    '2px',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}>
                      {v}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMemoryKey(k)}
                    style={{
                      background:   'none',
                      border:       'none',
                      cursor:       'pointer',
                      color:        'var(--text3)',
                      padding:      '4px',
                      borderRadius: '6px',
                      display:      'flex',
                      flexShrink:   0,
                      transition:   'color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Barchasini tozalash */}
            <button
              onClick={clearMemory}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '6px',
                padding:     '8px 16px',
                borderRadius:'var(--r-md)',
                border:      '1px solid rgba(248,113,113,0.25)',
                cursor:      'pointer',
                background:  'var(--error-soft)',
                color:       'var(--error)',
                fontSize:    '12px',
                fontWeight:  600,
                fontFamily:  'var(--font)',
                transition:  'all .15s',
              }}
            >
              <Trash2 size={13} />
              {t('clearMemory')}
            </button>
          </>
        )}
      </Section>
    </div>
  )
}