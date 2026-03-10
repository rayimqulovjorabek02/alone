// src/hooks/useAuth.js
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()
  return store
}

export function useRequireAuth() {
  const { isAuthenticated, fetchUser, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    } else if (!user) {
      fetchUser()
    }
  }, [])

  return user
}