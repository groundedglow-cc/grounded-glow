import { API_BASE_URL, AUTH_TOKEN_KEY } from './constants'
import { ApiError, type ApiResult } from '@/types/api'

type RequestOptions = RequestInit & {
  skipAuth?: boolean
}

function getToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

function clearAuth() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem('light_blog_user')
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let result: ApiResult<T> | null = null
  try {
    result = (await response.json()) as ApiResult<T>
  } catch {
    throw new ApiError(response.status, response.statusText || '请求失败')
  }

  if (!response.ok || result.code !== 200) {
    if (response.status === 401 || result.code === 401) {
      clearAuth()
    }
    throw new ApiError(result.code || response.status, result.message || '请求失败')
  }

  return result.data
}

export function toQueryString(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

