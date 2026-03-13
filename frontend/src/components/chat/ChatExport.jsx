// src/components/chat/ChatExport.jsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportAPI, downloadBlob } from '../../api/export'
import { Button } from '../ui'

export default function ChatExport({ messages, username }) {
  const [format,  setFormat]  = useState('txt')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!messages?.length) return
    setLoading(true)
    try {
      const title = `Alone AI — ${username || 'suhbat'}`
      const fns   = {
        txt:  exportAPI.chatTxt,
        md:   exportAPI.chatMd,
        docx: exportAPI.chatDocx,
        pdf:  exportAPI.chatPdf,
      }
      const names = { txt: 'chat.txt', md: 'chat.md', docx: 'chat.docx', pdf: 'chat.pdf' }
      const { data } = await fns[format](messages, title)
      downloadBlob(data, names[format])
    } catch (e) {
      console.error('Eksport xato:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={format}
        onChange={e => setFormat(e.target.value)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', color: 'var(--text2)',
          padding: '6px 10px', fontSize: '12px', outline: 'none',
          cursor: 'pointer',
        }}
      >
        <option value="txt">TXT</option>
        <option value="md">Markdown</option>
        <option value="docx">DOCX</option>
        <option value="pdf">PDF</option>
      </select>
      <Button
        onClick={handleExport}
        variant="secondary"
        size="sm"
        loading={loading}
        disabled={!messages?.length}
        icon={<Download size={13} />}
      >
        Eksport
      </Button>
    </div>
  )
}