'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { clearStoredAuth, getStoredToken, getStoredUser } from '@/lib/auth-store'

interface WujieAppProps {
  name: string
  url: string
  onAuthExpired?: () => void
}

export function WujieApp({ name, url, onAuthExpired }: WujieAppProps) {
  const subAppOrigin = new URL(url).origin
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const initialSrc = useRef(url)
  const authAcked = useRef(false)

  const sendAuthToChild = useCallback(() => {
    const token = getStoredToken()
    const user = getStoredUser()
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'AUTH_SYNC', token, user },
      subAppOrigin,
    )
  }, [subAppOrigin])

  // Retry AUTH_SYNC until sub app acknowledges
  useEffect(() => {
    authAcked.current = false
    const timer = setInterval(() => {
      if (authAcked.current) {
        clearInterval(timer)
        return
      }
      sendAuthToChild()
    }, 500)
    return () => clearInterval(timer)
  }, [sendAuthToChild])

  const basePath = usePathname().split('/').slice(0, 2).join('/')

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== subAppOrigin) return
      if (e.data?.type === 'AUTH_READY') {
        sendAuthToChild()
      }
      if (e.data?.type === 'AUTH_ACK') {
        authAcked.current = true
      }
      if (e.data?.type === 'AUTH_EXPIRED') {
        clearStoredAuth()
        onAuthExpired?.()
      }
      if (e.data?.type === 'ROUTE_CHANGE') {
        const subPath = e.data.path === '/' ? '' : e.data.path
        const newPath = basePath + subPath
        if (newPath !== window.location.pathname + window.location.search + window.location.hash) {
          window.history.replaceState(null, '', newPath)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onAuthExpired, subAppOrigin, basePath, sendAuthToChild])

  return (
    <iframe
      ref={iframeRef}
      title={name}
      src={initialSrc.current}
      onLoad={sendAuthToChild}
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  )
}
