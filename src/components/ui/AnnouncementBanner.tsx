'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Announcement {
  message: string
  type: 'info' | 'warning' | 'success' | 'event'
  link?: string
  linkText?: string
}

const TYPE_STYLES = {
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  event: 'border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 text-purple-100',
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const hidden = localStorage.getItem('announcement-dismissed') === 'true'
    setDismissed(hidden)

    const supabase = createClient()
    if (!supabase) return

    supabase
      .from('app_config')
      .select('value')
      .eq('key', 'announcement')
      .maybeSingle()
      .then((response: { data?: { value?: unknown } | null }) => {
        const data = response.data
        if (data?.value && typeof data.value === 'object' && 'message' in data.value) {
          const parsed = data.value as Record<string, unknown>
          const next: Announcement = {
            message: String(parsed.message || ''),
            type: (parsed.type as Announcement['type']) || 'info',
            link: typeof parsed.link === 'string' ? parsed.link : undefined,
            linkText: typeof parsed.linkText === 'string' ? parsed.linkText : undefined,
          }
          if (next.message) setAnnouncement(next)
        }
      })
      .catch(() => undefined)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('announcement-dismissed', 'true')
    setDismissed(true)
  }

  if (!announcement || dismissed) return null

  return (
    <div className={`border-b px-4 py-3 ${TYPE_STYLES[announcement.type]}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-sm">
        <div className="flex-1 text-center sm:text-left">
          <span>{announcement.message}</span>
          {announcement.link && (
            <a href={announcement.link} className="ml-2 underline underline-offset-4">
              {announcement.linkText || 'View'}
            </a>
          )}
        </div>
        <button type="button" onClick={handleDismiss} className="rounded-full p-1 hover:bg-white/10" aria-label="Dismiss announcement">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
