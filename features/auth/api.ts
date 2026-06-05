import { request } from '@/lib/api-client'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/user'

export function login(payload: LoginRequest) {
  return request<LoginResponse>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}

export function register(payload: RegisterRequest) {
  return request<void>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  })
}

export function getCurrentUser() {
  return request<User>('/api/users/me')
}

