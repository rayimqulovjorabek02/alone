// src/api/chat.js — WebSocket + REST
import { useAuthStore } from '../store/authStore'

const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`

export class ChatSocket {
  constructor({ onChunk, onDone, onError, onSessionCreated, onStart }) {
    this.ws             = null
    this.onChunk        = onChunk        || (() => {})
    this.onDone         = onDone         || (() => {})
    this.onError        = onError        || (() => {})
    this.onSessionCreated = onSessionCreated || (() => {})
    this.onStart        = onStart        || (() => {})
    this._retries       = 0
    this._maxRetries    = 3
  }

  async connect() {
    const token = await useAuthStore.getState().getValidToken()
    if (!token) throw new Error('Token topilmadi')

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${WS_BASE}/api/chat/ws/${token}`)

      this.ws.onopen = () => {
        this._retries = 0
        resolve(this)
      }

      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        switch (data.type) {
          case 'start':            this.onStart();                            break
          case 'chunk':            this.onChunk(data.content);                break
          case 'done':             this.onDone(data);                         break
          case 'error':            this.onError(data.message);                break
          case 'session_created':  this.onSessionCreated(data.session_id);    break
        }
      }

      this.ws.onerror = () => reject(new Error('WebSocket ulanmadi'))

      this.ws.onclose = async () => {
        if (this._retries < this._maxRetries) {
          this._retries++
          setTimeout(() => this.connect(), this._retries * 2000)
        }
      }
    })
  }

  send(message, sessionId = 0, model = 'llama-3.3-70b-versatile') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'message', message, session_id: sessionId, model }))
    }
  }

  disconnect() {
    this._maxRetries = 0
    this.ws?.close()
  }
}