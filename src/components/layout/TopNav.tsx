'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Zap,
  TreePine,
  Users,
  BarChart2,
  Trophy,
  Bot,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './NotificationBell'

const NAV_ITEMS = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',   emoji: '🏠' },
  { href: '/quests',       icon: Zap,             label: 'Quests',      emoji: '⚡' },
  { href: '/party',        icon: Users,           label: 'Party',       emoji: '👥' },
  { href: '/leaderboard',  icon: Trophy,          label: 'Leaderboard', emoji: '🏆' },
  { href: '/coach',        icon: Bot,             label: 'Coach',       emoji: '🤖' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/quests':      'Quest Manager',
  '/skills':      'Skill Tree',
  '/coach':       'AI Coach',
  '/party':       'Party',
  '/leaderboard': 'Leaderboard',
  '/analytics':   'Analytics',
  '/achievements':'Achievements',
}

interface TopNavProps {
  userAvatar?: string
  userName?: string
  userLevel?: number
}

export default function TopNav({ userAvatar = '⚔️', userName = 'Adventurer', userLevel = 1 }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Find the page title from pathname
  const pageTitle = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'Life RPG OS'

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-30 hidden md:flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(8,8,15,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1E1E35',
          paddingLeft: 264, // sidebar width + gap
        }}
      >
        {/* Page Title */}
        <h1 className="text-lg font-bold font-display" style={{ color: '#F1F0FF' }}>
          {pageTitle}
        </h1>

        {/* Right: Bell + Avatar */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* Avatar / user menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="user-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{ background: userMenuOpen ? '#7C3AED22' : 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#7C3AED22')}
              onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-xl">{userAvatar}</span>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold" style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif' }}>
                  {userName}
                </div>
                <div className="text-xs" style={{ color: '#F59E0B' }}>Lv.{userLevel}</div>
              </div>
              <ChevronDown size={14} style={{ color: '#5C5A7A' }} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    background: '#13131F',
                    border: '1px solid #2E2E50',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  {[
                    { href: '/dashboard', icon: User, label: 'View Profile' },
                    { href: '/dashboard', icon: Settings, label: 'Settings' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                      style={{ color: '#9B99B8' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1A1A2E'
                        e.currentTarget.style.color = '#F1F0FF'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#9B99B8'
                      }}
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid #1E1E35' }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#EF444411')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex md:hidden items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(8,8,15,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1E1E35',
        }}
      >
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ color: '#9B99B8' }}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <span className="text-sm font-bold" style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}>
            Life RPG OS
          </span>
        </div>

        <NotificationBell />
      </header>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 w-64 md:hidden flex flex-col"
              style={{ background: '#0F0F1A', borderRight: '1px solid #1E1E35' }}
            >
              <div className="px-6 py-5 border-b" style={{ borderColor: '#1E1E35' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{userAvatar}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#F1F0FF', fontFamily: 'Oxanium, sans-serif' }}>
                      {userName}
                    </div>
                    <div className="text-xs" style={{ color: '#F59E0B' }}>Level {userLevel}</div>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: active ? '#7C3AED22' : 'transparent',
                        color: active ? '#9F67FF' : '#9B99B8',
                        borderLeft: active ? '3px solid #7C3AED' : '3px solid transparent',
                      }}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  )
                })}
              </nav>
              <div className="px-4 py-4 border-t" style={{ borderColor: '#1E1E35' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{ color: '#5C5A7A' }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center"
        style={{
          background: 'rgba(13,13,25,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid #1E1E35',
          height: 64,
        }}
      >
        {NAV_ITEMS.map(({ href, emoji, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200"
              style={{ color: active ? '#9F67FF' : '#5C5A7A' }}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span
                className="text-xs"
                style={{
                  fontFamily: 'Oxanium, sans-serif',
                  fontSize: 10,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: '#7C3AED' }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
