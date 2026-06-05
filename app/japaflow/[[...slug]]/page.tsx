'use client'

import { usePathname, useRouter } from 'next/navigation'
import { WujieApp } from '@/components/wujie-app'

export default function JapaflowPage() {
  const router = useRouter()
  const pathname = usePathname()
  const subPath = pathname.replace(/^\/japaflow/, '') || '/'

  return (
    <div className="flex-1">
      <WujieApp
        name="japaflow"
        url={`http://localhost:5173${subPath}`}
        onAuthExpired={() => router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
      />
    </div>
  )
}
