'use client'

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants'
import type { LoginResponse, User } from '@/types/user'

export function getStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function storeLogin(response: LoginResponse) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, response.token)
  window.localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      id: response.id,
      username: response.username,
      email: response.email,
      avatar: response.avatar,
    }),
  )
}

export function storeUser(user: User) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

