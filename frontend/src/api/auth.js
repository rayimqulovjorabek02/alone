// src/api/auth.js
import api from './client'

export const authAPI = {
  login:           (username, password)       => api.post('/api/auth/login', { username, password }),
  register:        (username, email, password, avatar) => api.post('/api/auth/register', { username, email, password, avatar }),
  verify:          (user_id, code)            => api.post('/api/auth/verify', { user_id, code }),
  refresh:         (refresh_token)            => api.post('/api/auth/refresh', { refresh_token }),
  me:              ()                         => api.get('/api/auth/me'),
  logout:          ()                         => api.post('/api/auth/logout'),

  // Parolni tiklash
  forgotPassword:  (email)                    => api.post('/api/auth/forgot-password', { email }),
  verifyResetCode: (email, code)              => api.post('/api/auth/verify-reset-code', { email, code }),
  resetPassword:   (email, code, password)    => api.post('/api/auth/reset-password', { email, code, password }),

  // Parol o'zgartirish (login bo'lganda)
  changePassword:  (old_password, new_password) => api.post('/api/auth/change-password', { old_password, new_password }),
}