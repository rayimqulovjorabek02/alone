// src/pages/FileAnalysis.jsx
import { useState, useRef } from 'react'
import api                  from '../api/client'
import toast                from 'react-hot-toast'
import { useLang }          from '../i18n/LanguageContext'
import { Upload, FileText, X, Search, Copy, Check } from 'lucide-react'


export default function FileAnalysis() {
  const [file,     setFile]     = useState(null)
  const [question, setQuestion] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [copied,   setCopied]   = useState(false)
  const [dragging, setDragging] = useState(false)
  const [focused,  setFocused]  = useState(false)
  const inputRef                = useRef(null)
  const { t, lang }             = useLang()

  // ── Default savol — tilga qarab ────────────────────────────
  const defaultQuestion = {
    uz: "Bu faylni tahlil qil va asosiy ma'lumotlarni ber",
    ru: "Проанализируй этот файл и дай основную информацию",
    en: "Analyze this file and provide the main information",
  }

  const handleFile = (f) => {
    if (!f) return
    const allowed = ['.pdf', '.docx', '.txt', '.csv']
    const ext     = '.' + f.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) {
      toast.error(
        lang === 'uz' ? 'Faqat PDF, DOCX, TXT, CSV qabul qilinadi' :
        lang === 'ru' ? 'Принимаются только PDF, DOCX, TXT, CSV' :
                        'Only PDF, DOCX, TXT, CSV are accepted'
      )
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(
        lang === 'uz' ? 'Fayl 10MB dan oshmasin' :
        lang === 'ru' ? 'Файл не должен превышать 10MB' :
                        'File must not exceed 10MB'
      )
      return
    }
    setFile(f)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    if (!file) return toast.error(t('required'))
    const form = new FormData()
    form.append('file', file)
    form.append('question', question || defaultQuestion[lang] || defaultQuestion.uz)
    setLoading(true)
    try {
      const { data } = await api.post('/api/files/analyze', form)
      setResult(data)
    } catch (e) {
      toast.error(e.response?.data?.detail || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result?.analysis) return
    navigator.clipboard.writeText(result.analysis)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(t('copied'))
  }

  const formatSize = (bytes) => {
    if (bytes < 1024)       return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div style={{
      padding:   '28px 24px',
      overflowY: 'auto',
      height:    '100%',
      maxWidth:  '700px',
      margin:    '0 auto',
    }}>

      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width:          38,
            height:         38,
            borderRadius:   'var(--r-md)',
            background:     'rgba(245,158,11,0.15)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <FileText size={19} style={{ color: '#f59e0b' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.4px' }}>
            {t('files')}
          </h1>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '13px' }}>
          { lang === 'uz' && 'PDF, DOCX, TXT fayllarini AI bilan tahlil qiling' }
          { lang === 'ru' && 'Анализируйте PDF, DOCX, TXT файлы с помощью AI' }
          { lang === 'en' && 'Analyze PDF, DOCX, TXT files with AI' }
        </p>
      </div>

      {/* ── Fayl yuklash zonasi ───────────────────────────────── */}
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border:        `2px dashed ${dragging ? 'var(--accent)' : file ? '#f59e0b' : 'var(--border)'}`,
          borderRadius:  'var(--r-xl)',
          padding:       '40px',
          textAlign:     'center',
          cursor:        file ? 'default' : 'pointer',
          marginBottom:  '16px',
          background:    dragging
            ? 'rgba(124,58,237,0.05)'
            : file
            ? 'rgba(245,158,11,0.05)'
            : 'transparent',
          transition:    'all .2s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv"
          onChange={e => handleFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />

        {file ? (
          /* Fayl tanlangan holatda */
          <div>
            <div style={{
              width:          56,
              height:         56,
              borderRadius:   'var(--r-lg)',
              background:     'rgba(245,158,11,0.15)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 12px',
            }}>
              <FileText size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
              {file.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '12px' }}>
              {formatSize(file.size)} • {file.name.split('.').pop().toUpperCase()}
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }}
              style={{
                display:    'inline-flex',
                alignItems: 'center',
                gap:        '5px',
                background: 'var(--surface2)',
                border:     '1px solid var(--border)',
                cursor:     'pointer',
                color:      'var(--text3)',
                padding:    '5px 12px',
                borderRadius:'var(--r-md)',
                fontSize:   '12px',
                fontFamily: 'var(--font)',
                transition: 'color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <X size={13} />
              { lang === 'uz' ? 'Olib tashlash' : lang === 'ru' ? 'Убрать' : 'Remove' }
            </button>
          </div>
        ) : (
          /* Fayl tanlanmagan holat */
          <>
            <div style={{
              width:          56,
              height:         56,
              borderRadius:   'var(--r-lg)',
              background:     'var(--surface2)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 12px',
            }}>
              <Upload size={26} style={{ color: 'var(--text3)' }} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '15px' }}>
              { lang === 'uz' ? 'Fayl yuklash' : lang === 'ru' ? 'Загрузить файл' : 'Upload file' }
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
              { lang === 'uz' ? 'Bosing yoki suring' : lang === 'ru' ? 'Нажмите или перетащите' : 'Click or drag & drop' }
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
              PDF, DOCX, TXT, CSV • Max 10MB
            </div>
          </>
        )}
      </div>

      {/* ── Savol maydoni ─────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          fontSize:      '12px',
          fontWeight:    700,
          color:         'var(--text3)',
          display:       'block',
          marginBottom:  '7px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          { lang === 'uz' ? 'Savol' : lang === 'ru' ? 'Вопрос' : 'Question' }
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={defaultQuestion[lang] || defaultQuestion.uz}
          rows={2}
          style={{
            width:        '100%',
            padding:      '12px 14px',
            background:   'var(--surface)',
            border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            color:        'var(--text)',
            fontSize:     '14px',
            resize:       'none',
            outline:      'none',
            fontFamily:   'var(--font)',
            boxSizing:    'border-box',
            lineHeight:   1.6,
            transition:   'border-color .2s, box-shadow .2s',
            boxShadow:    focused ? '0 0 0 3px var(--accent-soft)' : 'none',
          }}
        />
      </div>

      {/* ── Tahlil tugmasi ────────────────────────────────────── */}
      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        style={{
          width:          '100%',
          padding:        '13px',
          borderRadius:   'var(--r-lg)',
          border:         'none',
          cursor:         !file || loading ? 'not-allowed' : 'pointer',
          background:     !file || loading
            ? 'var(--surface3)'
            : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color:          !file || loading ? 'var(--text3)' : 'white',
          fontSize:       '14px',
          fontWeight:     700,
          fontFamily:     'var(--font)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '8px',
          transition:     'all .2s',
          boxShadow:      !file || loading ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
          marginBottom:   '20px',
        }}
      >
        {loading ? (
          <>
            <span className="animate-spin" style={{
              width:          16,
              height:         16,
              border:         '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius:   '50%',
              display:        'inline-block',
            }} />
            { lang === 'uz' ? 'Tahlil qilinmoqda...' : lang === 'ru' ? 'Анализируется...' : 'Analyzing...' }
          </>
        ) : (
          <>
            <Search size={16} />
            { lang === 'uz' ? 'Tahlil qilish' : lang === 'ru' ? 'Анализировать' : 'Analyze' }
          </>
        )}
      </button>

      {/* ── Natija ───────────────────────────────────────────── */}
      {result && (
        <div style={{
          background:   'var(--surface)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding:      '20px',
          animation:    'fadeIn 0.4s var(--ease)',
        }}>
          {/* Natija sarlavhasi */}
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   '14px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>{result.filename}</span>
              {' '}•{' '}
              {result.text_len?.toLocaleString()}{' '}
              { lang === 'uz' ? 'belgi' : lang === 'ru' ? 'символов' : 'characters' }
            </div>
            <button
              onClick={handleCopy}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '5px',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      copied ? 'var(--success)' : 'var(--text3)',
                fontSize:   '12px',
                fontFamily: 'var(--font)',
                padding:    '4px 8px',
                borderRadius:'var(--r-sm)',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {t('copied') && copied ? t('copied') : t('copy')}
            </button>
          </div>

          {/* Tahlil matni */}
          <div style={{
            fontSize:   '14px',
            lineHeight: 1.7,
            color:      'var(--text2)',
            whiteSpace: 'pre-wrap',
          }}>
            {result.analysis}
          </div>
        </div>
      )}
    </div>
  )
}