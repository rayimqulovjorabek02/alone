// src/components/todo/TodoItem.jsx
import { Trash2 } from 'lucide-react'

const PRIORITY_COLORS = { high:'#f87171', normal:'#a78bfa', low:'#60a5fa' }

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'6px', opacity:todo.done?0.6:1 }}>
      <input type="checkbox" checked={!!todo.done} onChange={()=>onToggle(todo.id, !todo.done)}
        style={{ width:16, height:16, accentColor:'var(--accent)', cursor:'pointer', flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <span style={{ fontSize:'14px', textDecoration:todo.done?'line-through':'none', color:todo.done?'var(--text3)':'var(--text)' }}>{todo.title}</span>
        {todo.due_date && <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>📅 {todo.due_date}</div>}
      </div>
      <span style={{ fontSize:'10px', fontWeight:700, color:PRIORITY_COLORS[todo.priority]||'var(--text3)', padding:'2px 8px', borderRadius:'20px', background:`${PRIORITY_COLORS[todo.priority]||'gray'}15`, flexShrink:0 }}>
        {todo.priority}
      </span>
      <button onClick={()=>onDelete(todo.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', flexShrink:0 }}>
        <Trash2 size={14}/>
      </button>
    </div>
  )
}