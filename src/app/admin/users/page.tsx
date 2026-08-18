'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  display_name: string
  level: number
  xp: number
  streak: number
  created_at: string
  is_suspended: boolean
  is_admin: boolean
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    async function loadUsers() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, level, xp, streak, created_at, is_suspended, is_admin')
          .order('created_at', { ascending: false })

        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleToggleSuspend = async (userId: string, currentStatus: boolean) => {
    const supabase = createClient()
    if (!supabase) return

    try {
      await supabase
        .from('profiles')
        .update({ is_suspended: !currentStatus })
        .eq('id', userId)

      setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: !currentStatus } : u))
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    const supabase = createClient()
    if (!supabase) return

    try {
      await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)

      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u))
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const filtered = users.filter((user) => 
    user.display_name.toLowerCase().includes(query.toLowerCase()) ||
    user.id.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Users</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or ID"
          className="w-full max-w-md rounded-xl border border-slate-700 bg-[#101018] px-4 py-2 text-sm text-white outline-none focus:border-purple-500"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-[#101018] p-6 text-slate-300">Loading users…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101018]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0d0d15] text-slate-400">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Level</th>
                <th className="p-3">XP</th>
                <th className="p-3">Streak</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-slate-800">
                  <td className="p-3"><div className="font-semibold text-white">{user.display_name}</div><div className="text-xs text-slate-500">{user.id.slice(0, 8)}</div></td>
                  <td className="p-3">Lv. {user.level}</td>
                  <td className="p-3">{user.xp} XP</td>
                  <td className="p-3">🔥 {user.streak}</td>
                  <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {user.is_suspended && <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300">Suspended</span>}
                      {user.is_admin && <span className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-300">Admin</span>}
                      {!user.is_suspended && !user.is_admin && <span className="text-xs text-slate-500">Active</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => handleToggleSuspend(user.id, user.is_suspended)}
                        className={`rounded px-2 py-1 ${user.is_suspended ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                      >
                        {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button 
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                        className={`rounded px-2 py-1 ${user.is_admin ? 'bg-slate-500/20 text-slate-300' : 'bg-purple-500/20 text-purple-300'}`}
                      >
                        {user.is_admin ? 'Revoke' : 'Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
