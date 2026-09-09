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
  Bot,
  LogOut,
  Settings,
  Leaf,
  UserCircle2,
  BookOpen,
  Timer,
  LayoutGrid,
  Copy,
  Skull,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quests',         icon: Zap,             label: 'Quests' },
  { href: '/journal',        icon: BookOpen,        label: 'Journal' },
  { href: '/focus',          icon: Timer,           label: 'Focus Mode' },
  { href: '/skills',         icon: TreePine,        label: 'Skill Tree' },
  { href: '/coach',          icon: Bot,             label: 'AI Coach' },
  { href: '/party',          icon: Users,           label: 'Party' },
  { href: '/party/boss',     icon: Skull,           label: 'Boss Battle' },
  { href: '/shadow',         icon: Copy,            label: 'Shadow Clone' },
  { href: '/templates',      icon: LayoutGrid,      label: 'Templates' },
  { href: '/leaderboard',    icon: Trophy,          label: 'Leaderboard' },
  { href: '/analytics',      icon: BarChart2,       label: 'Analytics' },
  { href: '/achievements',   icon: Trophy,          label: 'Achievements' },
  { href: '/settings',       icon: Settings,        label: 'Settings' },
]

interface SidebarProps {
  userAvatar?: string
  userName?: string
  userLevel?: number
  completedToday?: number
}

export default function Sidebar({
  userAvatar,
  userName = 'Adventurer',
  userLevel = 1,
  completedToday,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isEmoji = (str?: string) => {
    if (!str) return false
    return /\p{Extended_Pictographic}/u.test(str)
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40"
      style={{
        width: 240,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #EAE6DD',
        boxShadow: '2px 0 16px rgba(35, 32, 25, 0.02)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Brand Logo Header */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#EAE6DD' }}>
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)',
            }}
          >
            <Leaf size={18} color="#FFFFFF" />
          </div>
          <div>
            <span
              className="text-base font-extrabold tracking-tight block"
              style={{ color: '#232019' }}
            >
              Life RPG OS
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider block" style={{ color: '#8A857A' }}>
              Level Up Reality
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const isDashboard = href === '/dashboard'
          const showBadge = isDashboard && completedToday !== undefined && completedToday > 0

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all duration-150 relative font-medium no-underline"
              style={{
                backgroundColor: active ? '#EDECFD' : 'transparent',
                color: active ? '#5B57F0' : '#6E6A61',
                fontWeight: active ? 700 : 500,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = '#FAF8F5'
                  e.currentTarget.style.color = '#232019'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6E6A61'
                }
              }}
            >
              <Icon size={17} className={active ? 'text-[#5B57F0]' : 'text-[#8A857A]'} />
              <span className="flex-1 truncate">{label}</span>

              {/* Completion badge on Dashboard */}
              {showBadge && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  {completedToday}
                </span>
              )}

              {/* AI Coach indicator dot */}
              {href === '/coach' && !active && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#5B57F0', boxShadow: '0 0 6px rgba(91, 87, 240, 0.4)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t" style={{ borderColor: '#EAE6DD', backgroundColor: '#FAF8F5' }}>
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EAE6DD] mb-2 shadow-sm">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#EDECFD', border: '1px solid #D6D3FA' }}
          >
            {userAvatar && isEmoji(userAvatar) ? (
              <span className="text-lg leading-none">{userAvatar}</span>
            ) : (
              <Leaf size={18} color="#10B981" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-bold truncate leading-snug"
              style={{ color: '#232019' }}
            >
              {userName}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: '#D97706' }}>
              Level {userLevel}
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-md text-[11px] font-bold flex-shrink-0"
            style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}
          >
            Lv.{userLevel}
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border border-transparent"
          style={{ color: '#8A857A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2'
            e.currentTarget.style.color = '#DC2626'
            e.currentTarget.style.borderColor = '#FEE2E2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#8A857A'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
