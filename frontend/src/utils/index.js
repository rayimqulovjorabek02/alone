// src/utils/index.js — Yordamchi funksiyalar

// ── SANA / VAQT ───────────────────────────────
export function formatDate(date, format = 'dd.MM.yyyy') {
  if (!date) return ''
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  const map = {
    dd:   pad(d.getDate()),
    MM:   pad(d.getMonth() + 1),
    yyyy: d.getFullYear(),
    HH:   pad(d.getHours()),
    mm:   pad(d.getMinutes()),
    ss:   pad(d.getSeconds()),
  }
  return format.replace(/dd|MM|yyyy|HH|mm|ss/g, m => map[m])
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const sec  = Math.floor(diff / 1000)
  if (sec < 60)   return 'Hozirgina'
  if (sec < 3600) return `${Math.floor(sec / 60)} daqiqa oldin`
  if (sec < 86400)return `${Math.floor(sec / 3600)} soat oldin`
  return `${Math.floor(sec / 86400)} kun oldin`
}

export function isToday(date) {
  const d = new Date(date)
  const n = new Date()
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
}

// ── MATN ──────────────────────────────────────
export function truncate(str, len = 100) {
  if (!str) return ''
  return str.length <= len ? str : str.slice(0, len) + '...'
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length
}

// ── FAYL ──────────────────────────────────────
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k    = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i    = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map = {
    pdf: '📄', doc: '📝', docx: '📝', txt: '📝', md: '📝',
    xls: '📊', xlsx: '📊', csv: '📊',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    mp3: '🎵', wav: '🎵', ogg: '🎵',
    mp4: '🎬', avi: '🎬', mkv: '🎬',
    zip: '📦', rar: '📦', tar: '📦',
    py: '🐍', js: '📜', ts: '📜', jsx: '📜',
    json: '🔧', yaml: '🔧', yml: '🔧',
  }
  return map[ext] || '📄'
}

// ── RANG ──────────────────────────────────────
export function hexToRgba(hex, alpha = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(0,0,0,${alpha})`
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── VALIDATSIYA ───────────────────────────────
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url) {
  try { new URL(url); return true } catch { return false }
}

export function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8)               score++
  if (/[A-Z]/.test(pw))             score++
  if (/[a-z]/.test(pw))             score++
  if (/[0-9]/.test(pw))             score++
  if (/[!@#$%^&*()_+]/.test(pw))   score++
  const labels = ['', 'Juda zaif', 'Zaif', "O'rtacha", 'Yaxshi', 'Kuchli']
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981']
  return { score, label: labels[score], color: colors[score] }
}

// ── RAQAM ─────────────────────────────────────
export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// ── NUSXA ─────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}

// ── DEBOUNCE ──────────────────────────────────
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ── STORAGE ───────────────────────────────────
export const storage = {
  get:    (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  },
  set:    (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove: (key)        => { try { localStorage.removeItem(key) } catch {} },
  clear:  ()           => { try { localStorage.clear() } catch {} },
}