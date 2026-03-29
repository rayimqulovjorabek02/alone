// src/pages/Todo.jsx
import TodoList from '../components/todo/TodoList'
import { useLang } from '../i18n/LanguageContext'
import { CheckSquare } from 'lucide-react'

export default function Todo() {
  const { t } = useLang()
  return (
    <div style={{ padding:'28px 24px', overflowY:'auto', height:'100%', maxWidth:'620px', margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
        <div style={{ width:38, height:38, borderRadius:'12px', background:'rgba(34,197,94,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CheckSquare size={20} style={{ color:'#22c55e' }} />
        </div>
        <h1 style={{ fontSize:'22px', fontWeight:800 }}>{t('todo')}</h1>
      </div>
      <p style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>{t('manageTasks')}</p>
      <TodoList />
    </div>
  )
}