import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  const navItems = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/feedback', label: 'Feedback' },
    { href: '/admin/config', label: 'Config' },
    { href: '/admin/logs', label: 'Logs' },
  ]

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-slate-800 bg-[#050508]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3 font-bold text-lg tracking-wide">
            <span className="text-2xl">⚔️</span>
            <span className="font-display">Life RPG OS — Admin</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <a href="/dashboard" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-purple-500 hover:text-white">
            Back to App
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  )
}
