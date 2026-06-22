'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Zap,
  TreePine,
  Users,
  BarChart2,
  Trophy,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quests',       icon: Zap,             label: 'Quests' },
  { href: '/skills',       icon: TreePine,        label: 'Skill Tree' },
  { href: '/party',        icon: Users,           label: 'Party' },
  { href: '/analytics',    icon: BarChart2,       label: 'Analytics' },
  { href: '/achievements', icon: Trophy,          label: 'Achievements' },
]

interface SidebarProps {
  userAvatar?: string
  userName?: string
  userLevel?: number
}

export default function Sidebar({ userAvatar = '⚔️', userName = 'Adventurer', userLevel = 1 }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{
        width: 240,
        background: '#0F0F1A',
        borderRight: '1px solid #1E1E35',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: '#1E1E35' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'Oxanium, sans-serif', color: '#F59E0B' }}
          >
            Life RPG OS
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={{
                background: active ? '#7C3AED22' : 'transparent',
                color: active ? '#9F67FF' : '#9B99B8',
                borderLeft: active ? '3px solid #7C3AED' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = '#1A1A2E'
                  e.currentTarget.style.color = '#F1F0FF'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#9B99B8'
                }
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t" style={{ borderColor: '#1E1E35' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{userAvatar}</div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold truncate"
              style={{ fontFamily: 'Oxanium, sans-serif', color: '#F1F0FF' }}
            >
              {userName}
            </div>
            <div className="text-xs" style={{ color: '#F59E0B' }}>
              Level {userLevel}
            </div>
          </div>
          {/* Level badge */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#F59E0B22', color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}
          >
            {userLevel}
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200"
          style={{ color: '#5C5A7A' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EF444422'
            e.currentTarget.style.color = '#EF4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#5C5A7A'
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
