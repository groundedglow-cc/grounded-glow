'use client'

import { usePathname, useRouter } from 'next/navigation'
import { WujieApp } from '@/components/wujie-app'
import { JAPAFLOW_APP_URL } from '@/lib/constants'

export default function JapaflowPage() {
  const router = useRouter()
  const pathname = usePathname()
  const subPath = pathname.replace(/^\/japaflow/, '') || '/'

  return (
    <div className="flex-1">
      <WujieApp
        name="japaflow"
        url={`${JAPAFLOW_APP_URL}${subPath}`}
        onAuthExpired={() => router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`)}
      />
    </div>
  )
}
