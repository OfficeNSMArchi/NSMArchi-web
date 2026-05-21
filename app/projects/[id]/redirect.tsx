'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ProjectRedirect({ id, targetUrl, storageKey }: {
  id: string
  targetUrl: string
  storageKey: string
}) {
  const router = useRouter()

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([id]))
    } catch {}
    router.replace(targetUrl)
  }, [id, targetUrl, storageKey, router])

  return null
}
