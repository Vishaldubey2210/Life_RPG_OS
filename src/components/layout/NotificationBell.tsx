'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: string
  from_user_id: string | null
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function notifIcon(type: string): string {
  switch (type) {
    case 'party_invite': return '👥'
    case 'couple_invite': return '💑'
    case 'guild_invite': return '🏰'
    case 'friend_completed': return '🎯'
    case 'streak_cheer': return '🔥'
    case 'level_up_congrats': return '⚡'
    case 'achievement_earned': return '🏆'
    case 'weekly_report': return '📊'
    default: return '🔔'
  }
}

export default function NotificationBell() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await fetchNotifications(user.id)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications(uid: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) setNotifications(data)
  }

  async function markAllRead() {
    await fetch('/api/notifications/read', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markOneRead(id: string) {
    await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: [id] }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
        style={{
          background: open ? '#7C3AED22' : 'transparent',
          color: open ? '#9F67FF' : '#9B99B8',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#7C3AED22'
          e.currentTarget.style.color = '#9F67FF'
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#9B99B8'
          }
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontFamily: 'Oxanium, sans-serif' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
            style={{
              background: '#13131F',
              border: '1px solid #2E2E50',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: '#1E1E35' }}
            >
              <span className="text-sm font-semibold font-display" style={{ color: '#F1F0FF' }}>
                Notifications
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
                    style={{ color: '#9F67FF' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#7C3AED22'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: '#5C5A7A' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F1F0FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#5C5A7A'}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <div className="text-sm" style={{ color: '#5C5A7A' }}>No notifications yet</div>
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => markOneRead(notif.id)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b"
                    style={{
                      background: notif.is_read ? 'transparent' : '#7C3AED08',
                      borderColor: '#1E1E35',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A2E')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = notif.is_read ? 'transparent' : '#7C3AED08')}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: '#1E1E35' }}
                    >
                      {notifIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-semibold truncate"
                        style={{ color: notif.is_read ? '#9B99B8' : '#F1F0FF' }}
                      >
                        {notif.title}
                      </div>
                      {notif.body && (
                        <div className="text-xs mt-0.5 line-clamp-2" style={{ color: '#5C5A7A' }}>
                          {notif.body}
                        </div>
                      )}
                      <div className="text-xs mt-1" style={{ color: '#5C5A7A' }}>
                        {timeAgo(notif.created_at)}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{ background: '#7C3AED', boxShadow: '0 0 6px #7C3AED' }}
                      />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
