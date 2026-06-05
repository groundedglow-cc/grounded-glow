'use client'

import { usePathname, useRouter } from 'next/navigation'
import { WujieApp } from '@/components/wujie-app'

export default function BlogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const subPath = pathname.replace(/^\/blog/, '') || '/'

  return (
    <div className="flex-1">
      <WujieApp
        name="blog"
        url={`http://localhost:3001${subPath}`}
        onAuthExpired={() => router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
      />
    </div>
  )
}
