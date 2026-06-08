'use client'

import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './constants'
import type { LoginResponse, User } from '@/types/user'

function getCookieDomain() {
  if (typeof window === 'undefined') return ''
  return window.location.hostname === 'localhost' ? '' : '.groundedglow.cc'
}

function setCookie(name: string, value: string) {
  const domain = getCookieDomain()
  const domainAttr = domain ? `; domain=${domain}` : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${domainAttr}; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
}

function deleteCookie(name: string) {
  const domain = getCookieDomain()
  const domainAttr = domain ? `; domain=${domain}` : ''
  document.cookie = `${name}=; path=/${domainAttr}; max-age=0`
}

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
  const token = response.token
  const user = JSON.stringify({
    id: response.id,
    username: response.username,
    email: response.email,
    avatar: response.avatar,
  })
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.setItem(AUTH_USER_KEY, user)
  setCookie(AUTH_TOKEN_KEY, token)
  setCookie(AUTH_USER_KEY, user)
}

export function storeUser(user: User) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
  deleteCookie(AUTH_TOKEN_KEY)
  deleteCookie(AUTH_USER_KEY)
}
