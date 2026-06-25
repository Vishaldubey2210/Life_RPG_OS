'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { User, Bell, Shield, AlertTriangle, Download, KeyRound } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

const AVATAR_OPTIONS = [
  '⚔️','🧙','🏹','🛡️','🔮','⚡','🐉','🦁','🐺','🦅',
  '🌙','☀️','🌊','🔥','💎','👑','🌟','🎯','💪','🧠',
]

export default function SettingsPage() {
  const { profile, loading, refetch } = useProfile()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '')
      setAvatarEmoji(profile.avatar_emoji ?? '⚔️')
    }
    supabase.auth.getUser().then((res: any) => {
      if (res.data?.user) setUserEmail(res.data.user.email ?? '')
    })
  }, [profile, supabase.auth])

  async function handleSaveProfile() {
    if (!profile?.id) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, avatar_emoji: avatarEmoji, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (error) throw error
      toast.success('Profile saved! ✅')
      refetch()
    } catch (err) {
      toast.error('Failed to save profile')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail)
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
    } catch {
      toast.error('Failed to send reset email')
    }
  }

  async function handleExportData() {
    if (!profile?.id) return
    try {
      const [profileRes, statsRes, habitsRes, completionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', profile.id).single(),
        supabase.from('stats').select('*').eq('user_id', profile.id).single(),
        supabase.from('habits').select('*').eq('user_id', profile.id),
        supabase.from('habit_completions').select('*').eq('user_id', profile.id),
      ])
      const exportData = {
        profile: profileRes.data,
        stats: statsRes.data,
        habits: habitsRes.data,
        completions: completionsRes.data,
        exported_at: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `life-rpg-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported! 📥')
    } catch {
      toast.error('Export failed')
    }
  }

  async function handleResetProgress() {
    if (resetInput !== 'RESET') return
    if (!profile?.id) return
    try {
      await supabase.from('habit_completions').delete().eq('user_id', profile.id)
      await supabase.from('profiles').update({
        xp: 0, level: 1, xp_to_next: 100, streak: 0, hp: 100,
      }).eq('id', profile.id)
      await supabase.from('stats').update({
        str: 0, int: 0, wis: 0, vit: 0, gold: 0, cha: 0,
      }).eq('user_id', profile.id)
      toast.success('Progress reset. Fresh start, adventurer! ⚔️')
      setShowReset(false)
      setResetInput('')
      refetch()
    } catch {
      toast.error('Reset failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08080F' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚙️</div>
          <div className="text-sm" style={{ color: '#5C5A7A', fontFamily: 'Oxanium, sans-serif' }}>Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#08080F' }}>
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? '⚔️'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
        <div className="p-6 xl:p-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-1 font-display" style={{ color: '#F1F0FF' }}>Settings ⚙️</h1>
            <p style={{ color: '#9B99B8' }}>Manage your account and preferences.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <motion.section
              className="p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <User size={16} style={{ color: '#7C3AED' }} />
                <h2 className="font-bold font-display" style={{ color: '#F1F0FF' }}>Profile</h2>
              </div>

              {/* Avatar picker */}
              <div className="mb-5">
                <label className="block text-xs mb-2" style={{ color: '#9B99B8' }}>Avatar Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAvatarEmoji(emoji)}
                      className="text-2xl p-2 rounded-xl transition-all duration-150"
                      style={{
                        background: avatarEmoji === emoji ? '#7C3AED33' : '#0F0F1A',
                        border: `2px solid ${avatarEmoji === emoji ? '#7C3AED' : '#1E1E35'}`,
                        transform: avatarEmoji === emoji ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display name */}
              <div className="mb-5">
                <label className="block text-xs mb-2" style={{ color: '#9B99B8' }}>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #2E2E50',
                    color: '#F1F0FF',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#2E2E50')}
                />
              </div>

              {/* Bio */}
              <div className="mb-5">
                <label className="block text-xs mb-2" style={{ color: '#9B99B8' }}>Bio / Tagline</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 100))}
                  rows={2}
                  maxLength={100}
                  placeholder="e.g. Building the best version of myself, one quest at a time."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                  style={{
                    background: '#0F0F1A',
                    border: '1px solid #2E2E50',
                    color: '#F1F0FF',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#2E2E50')}
                />
                <div className="text-right text-xs mt-1" style={{ color: '#5C5A7A' }}>{bio.length}/100</div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: saving ? '#5C5A7A' : '#7C3AED',
                  color: '#fff',
                  fontFamily: 'Oxanium, sans-serif',
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </motion.section>

            {/* Notifications */}
            <motion.section
              className="p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Bell size={16} style={{ color: '#3B82F6' }} />
                <h2 className="font-bold font-display" style={{ color: '#F1F0FF' }}>Notifications</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Party member completes a quest', key: 'party_complete' },
                  { label: 'Someone reacts to my completion', key: 'reaction_received' },
                  { label: 'Achievement earned', key: 'achievement_earned' },
                  { label: 'Weekly report (every Sunday)', key: 'weekly_report' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#9B99B8' }}>{item.label}</span>
                    <div
                      className="w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200"
                      style={{ background: '#7C3AED' }}
                      onClick={() => toast.info('Notification settings coming soon!')}
                    >
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Account */}
            <motion.section
              className="p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Shield size={16} style={{ color: '#22C55E' }} />
                <h2 className="font-bold font-display" style={{ color: '#F1F0FF' }}>Account</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: '#5C5A7A' }}>Email</label>
                  <div className="text-sm px-4 py-3 rounded-xl" style={{ background: '#0F0F1A', color: '#9B99B8', border: '1px solid #1E1E35' }}>
                    {userEmail || 'Loading...'}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: '#0F0F1A', color: '#9B99B8', border: '1px solid #2E2E50' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#9F67FF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E50'; e.currentTarget.style.color = '#9B99B8' }}
                  >
                    <KeyRound size={14} />
                    Change Password
                  </button>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: '#0F0F1A', color: '#9B99B8', border: '1px solid #2E2E50' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.color = '#22C55E' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E50'; e.currentTarget.style.color = '#9B99B8' }}
                  >
                    <Download size={14} />
                    Export My Data
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Appearance */}
            <motion.section
              className="p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#1E1E35' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h2 className="font-bold font-display mb-3" style={{ color: '#F1F0FF' }}>Appearance 🎨</h2>
              <div className="py-4 text-center rounded-xl" style={{ background: '#0F0F1A', border: '1px dashed #2E2E50' }}>
                <div className="text-2xl mb-2">🎨</div>
                <p className="text-sm" style={{ color: '#5C5A7A' }}>Custom themes coming soon</p>
              </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.section
              className="p-6 rounded-2xl border"
              style={{ background: '#13131F', borderColor: '#EF444444' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                <h2 className="font-bold font-display" style={{ color: '#EF4444' }}>Danger Zone</h2>
              </div>

              {!showReset ? (
                <button
                  onClick={() => setShowReset(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: '#EF444415', color: '#EF4444', border: '1px solid #EF444444' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EF444425'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EF444415'}
                >
                  Reset Progress
                </button>
              ) : (
                <div className="p-4 rounded-xl" style={{ background: '#EF444411', border: '1px solid #EF444444' }}>
                  <p className="text-sm mb-3" style={{ color: '#EF4444' }}>
                    ⚠️ This will clear all XP, levels, stats, and completions. Your habits/quests will remain.
                    Type <strong>RESET</strong> to confirm.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type RESET"
                      value={resetInput}
                      onChange={e => setResetInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: '#0F0F1A', border: '1px solid #EF444455', color: '#F1F0FF' }}
                    />
                    <button
                      onClick={handleResetProgress}
                      disabled={resetInput !== 'RESET'}
                      className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: resetInput === 'RESET' ? '#EF4444' : '#3E1E1E',
                        color: '#fff',
                        fontFamily: 'Oxanium, sans-serif',
                        cursor: resetInput === 'RESET' ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => { setShowReset(false); setResetInput('') }}
                      className="px-4 py-2 rounded-lg text-sm transition-all"
                      style={{ background: '#1E1E35', color: '#9B99B8' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  )
}
