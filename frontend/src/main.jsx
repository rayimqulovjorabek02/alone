// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#18181f',
          color: '#f0f0f5',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#18181f' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#18181f' } },
      }}
    />
  </React.StrictMode>
)