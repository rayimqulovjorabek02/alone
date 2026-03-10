// public/sw.js — Service Worker (PWA)
const CACHE_NAME    = 'alone-ai-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install — statik fayllarni keshlash
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

// Activate — eski keshlarni tozalash
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch — Network-first strategiya (API), Cache-first (statik)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // API so'rovlari — doimo tarmoqdan
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    return
  }

  // WebSocket — o'tkazib yuborish
  if (e.request.url.startsWith('ws')) {
    return
  }

  // Statik fayllar — cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached

      return fetch(e.request)
        .then((response) => {
          // Muvaffaqiyatli javoblarni keshlash
          if (response.ok && e.request.method === 'GET') {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, clone)
            })
          }
          return response
        })
        .catch(() => {
          // Offline — index.html qaytarish (SPA uchun)
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
    })
  )
})

// Push notification
self.addEventListener('push', (e) => {
  const data = e.data?.json() || {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Alone AI', {
      body:    data.message || 'Yangi bildirishnoma',
      icon:    '/icon-192.png',
      badge:   '/icon-72.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.openWindow(e.notification.data?.url || '/')
  )
})