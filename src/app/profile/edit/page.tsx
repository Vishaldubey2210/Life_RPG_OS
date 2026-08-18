'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const AVATAR_OPTIONS = ['⚔️','🧙','🏹','🛡️','🔮','⚡','🐉','🦁','🐺','🦅','🌙','☀️','🌊','🔥','💎','👑','🌟','🎯','💪','🧠']

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('⚔️')
  const [bio, setBio] = useState('')
  const [publicProfile, setPublicProfile] = useState(true)
  const [usernameAvailable, setUsernameAvailable] = useState(true)

  useEffect(() => {
    if (!supabase) return

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setDisplayName(data.display_name || '')
        setUsername(data.username || '')
        setAvatarEmoji(data.avatar_emoji || '⚔️')
        setBio(data.bio || '')
        setPublicProfile(data.is_public ?? true)
      }
      setLoading(false)
    }

    load()
  }, [router, supabase])

  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(true)
      return
    }

    const timeout = setTimeout(async () => {
      if (!supabase) return
      const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle()
      setUsernameAvailable(!data)
    }, 300)

    return () => clearTimeout(timeout)
  }, [username, supabase])

  const handleSave = async () => {
    if (!supabase) return
    if (!displayName.trim() || username.trim().length < 2) {
      toast.error('Display name and username are required.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim(),
          avatar_emoji: avatarEmoji,
          bio: bio.trim(),
          is_public: publicProfile,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated!')
      router.push('/dashboard')
    } catch {
      toast.error('Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#08080F] text-white">Loading…</div>
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-white">
      <h1 className="mb-6 text-3xl font-bold">Edit profile</h1>

      <div className="space-y-6 rounded-3xl border border-slate-800 bg-[#101018] p-6">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Avatar Emoji</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatarEmoji(emoji)}
                className={`rounded-xl border p-2 text-2xl transition ${avatarEmoji === emoji ? 'scale-110 border-yellow-400 bg-yellow-500/10' : 'border-slate-700 bg-[#0d0d15]'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-[#0d0d15] px-4 py-3 text-white" />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={`w-full rounded-xl border bg-[#0d0d15] px-4 py-3 text-white ${usernameAvailable ? 'border-slate-700' : 'border-red-500'}`} />
          <div className={`mt-2 text-xs ${usernameAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
            {username.trim() ? (usernameAvailable ? 'Username available' : 'Username unavailable') : 'Choose a username'}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Bio / tagline</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-700 bg-[#0d0d15] px-4 py-3 text-white" />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0d0d15] p-4">
          <div>
            <div className="font-medium">Public profile</div>
            <div className="text-sm text-slate-400">Visible on your profile page</div>
          </div>
          <input type="checkbox" checked={publicProfile} onChange={(e) => setPublicProfile(e.target.checked)} className="h-5 w-5" />
        </label>

        <button type="button" onClick={handleSave} disabled={saving || !usernameAvailable} className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </main>
  )
}
