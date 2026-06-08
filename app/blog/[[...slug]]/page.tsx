'use client'

import { usePathname, useRouter } from 'next/navigation'
import { WujieApp } from '@/components/wujie-app'
import { BLOG_APP_URL } from '@/lib/constants'

export default function BlogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const subPath = pathname.replace(/^\/blog/, '') || '/'

  return (
    <div className="flex-1">
      <WujieApp
        name="blog"
        url={`${BLOG_APP_URL}${subPath}`}
        onAuthExpired={() => router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
      />
    </div>
  )
}
