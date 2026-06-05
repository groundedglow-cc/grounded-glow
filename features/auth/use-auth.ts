'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from './api'
import { clearStoredAuth, getStoredToken, getStoredUser, storeUser } from '@/lib/auth-store'

export function useAuth() {
  const router = useRouter()
  const hasToken = typeof window !== 'undefined' && Boolean(getStoredToken())

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await getCurrentUser()
      storeUser(user)
      return user
    },
    enabled: hasToken,
    initialData: getStoredUser() ?? undefined,
  })

  function logout() {
    clearStoredAuth()
    router.push('/login')
  }

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isLoggedIn: hasToken,
    logout,
  }
}

