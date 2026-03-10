// src/i18n/LanguageContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import translations from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() =>
    localStorage.getItem('lang') || 'uz'
  )

  const t = (key) =>
    translations[lang]?.[key] ?? translations['uz']?.[key] ?? key

  const changeLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }

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