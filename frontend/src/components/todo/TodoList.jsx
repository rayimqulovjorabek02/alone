// src/components/todo/TodoList.jsx
import { useState, useEffect } from 'react'
import api from '../../api/client'
import TodoItem from './TodoItem'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function TodoList() {
  const [todos,    setTodos]    = useState([])
  const [title,    setTitle]    = useState('')
  const [priority, setPriority] = useState('normal')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await api.get('/api/todo')
    setTodos(data || [])
  }

  const add = async () => {
    if (!title.trim()) return
    await api.post('/api/todo', { title, priority })
    setTitle('')
    await load()
  }

  const toggle = async (id, done) => {
    await api.put(`/api/todo/${id}`, { done })
    setTodos(t => t.map(x => x.id===id ? {...x, done} : x))
  }

  const del = async (id) => {
    await api.delete(`/api/todo/${id}`)
    setTodos(t => t.filter(x => x.id !== id))
  }

  const done  = todos.filter(t => t.done).length
  const total = todos.length

  return (
    <div>
      {/* Add */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Yangi vazifa..."
          onKeyDown={e=>e.key==='Enter'&&add()}
          style={{ flex:1, padding:'9px 12px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'13px', outline:'none' }}/>
        <select value={priority} onChange={e=>setPriority(e.target.value)}
          style={{ padding:'9px 10px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text2)', fontSize:'12px', cursor:'pointer' }}>
          <option value="low">🟢 Past</option>
          <option value="normal">🟡 Oddiy</option>
          <option value="high">🔴 Yuqori</option>
        </select>
        <button onClick={add} style={{ padding:'9px 14px', borderRadius:'10px', border:'none', cursor:'pointer', background:'var(--accent)', color:'white', display:'flex', alignItems:'center' }}>
          <Plus size={16}/>
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text3)', marginBottom:'4px' }}>
            <span>{done}/{total} bajarildi</span>
            <span>{Math.round(done/total*100)}%</span>
          </div>
          <div style={{ height:4, background:'var(--surface2)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${done/total*100}%`, height:'100%', background:'var(--accent)', transition:'width .3s' }}/>
          </div>
        </div>
      )}

      {todos.length === 0 ? (
        <p style={{ color:'var(--text3)', fontSize:'13px', textAlign:'center', padding:'20px' }}>Vazifalar yo'q</p>
      ) : todos.map(t => <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={del}/>)}
    </div>
  )
}