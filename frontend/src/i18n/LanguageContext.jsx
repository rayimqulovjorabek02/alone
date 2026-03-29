// src/i18n/LanguageContext.jsx
// settingsStore bilan sinxronlashtirilgan til tizimi
import { createContext, useContext, useState, useEffect } from 'react'
import translations from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  // localStorage dan boshlang'ich til — login bo'lmagan holat uchun
  const [lang, setLang] = useState(() =>
    localStorage.getItem('lang') || 'uz'
  )

  const t = (key) =>
    translations[lang]?.[key] ?? translations['uz']?.[key] ?? key

  const changeLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
    document.documentElement.lang = newLang
  }

  // settingsStore saqlanganda lang-change event chiqaradi — shu yerda ushlaylik
  useEffect(() => {
    const handler = (e) => setLang(e.detail)
    window.addEventListener('lang-change', handler)
    return () => window.removeEventListener('lang-change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}