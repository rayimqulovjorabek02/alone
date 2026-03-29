// src/components/todo/TodoList.jsx
import { useState, useEffect } from 'react'
import api                     from '../../api/client'
import TodoItem                from './TodoItem'
import toast                   from 'react-hot-toast'
import { useLang }             from '../../i18n/LanguageContext'
import { Plus }                from 'lucide-react'

export default function TodoList() {
  const [todos,    setTodos]    = useState([])
  const [title,    setTitle]    = useState('')
  const [priority, setPriority] = useState('normal')
  const [focused,  setFocused]  = useState(false)
  const { t, lang }             = useLang()

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await api.get('/api/todo')
      setTodos(data || [])
    } catch {}
  }

  const add = async () => {
    if (!title.trim()) return
    try {
      await api.post('/api/todo', { title, priority })
      setTitle('')
      await load()
    } catch {
      toast.error(t('error'))
    }
  }

  const toggle = async (id, done) => {
    await api.put(`/api/todo/${id}`, { done })
    setTodos(ts => ts.map(x => x.id === id ? { ...x, done } : x))
  }

  const del = async (id) => {
    await api.delete(`/api/todo/${id}`)
    setTodos(ts => ts.filter(x => x.id !== id))
  }

  const done  = todos.filter(ts => ts.done).length
  const total = todos.length

  const PRIORITIES = [
    { value: 'low',    label: lang === 'ru' ? '🟢 Низкий'  : lang === 'en' ? '🟢 Low'    : '🟢 Past'   },
    { value: 'normal', label: lang === 'ru' ? '🟡 Обычный' : lang === 'en' ? '🟡 Normal'  : '🟡 Oddiy'  },
    { value: 'high',   label: lang === 'ru' ? '🔴 Высокий' : lang === 'en' ? '🔴 High'   : '🔴 Yuqori' },
  ]

  return (
    <div>
      {/* Qo'shish formasi */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={
            lang === 'ru' ? 'Новая задача...' :
            lang === 'en' ? 'New task...' :
                            'Yangi vazifa...'
          }
          style={{
            flex:         1,
            padding:      '9px 12px',
            background:   'var(--surface)',
            border:       `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            color:        'var(--text)',
            fontSize:     '13px',
            outline:      'none',
            fontFamily:   'var(--font)',
            transition:   'border-color .2s',
          }}
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          style={{
            padding:      '9px 10px',
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            color:        'var(--text2)',
            fontSize:     '12px',
            cursor:       'pointer',
            fontFamily:   'var(--font)',
          }}
        >
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button
          onClick={add}
          style={{
            padding:        '9px 14px',
            borderRadius:   'var(--r-lg)',
            border:         'none',
            cursor:         'pointer',
            background:     'var(--accent)',
            color:          'white',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'opacity .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
            <span>
              {done}/{total} {lang === 'ru' ? 'выполнено' : lang === 'en' ? 'completed' : 'bajarildi'}
            </span>
            <span>{Math.round(done / total * 100)}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${done / total * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width .3s' }} />
          </div>
        </div>
      )}

      {/* Ro'yxat */}
      {todos.length === 0 ? (
        <p style={{ color: 'var(--text3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          {t('noTodos')}
        </p>
      ) : (
        todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggle} onDelete={del} />
        ))
      )}
    </div>
  )
}