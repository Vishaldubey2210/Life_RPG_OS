'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { User, Bell, Shield, AlertTriangle, Download, KeyRound, Palette, Settings as SettingsIcon } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import DynamicIcon from '@/components/ui/DynamicIcon'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'

const AVATAR_OPTIONS = [
  'leaf', 'swords', 'wizard', 'archer', 'shield', 'crystal', 'zap',
  'dragon', 'lion', 'wolf', 'eagle', 'moon', 'sun',
  'droplets', 'flame', 'diamond', 'crown', 'star', 'target',
  'dumbbell', 'brain'
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
      setAvatarEmoji(profile.avatar_emoji ?? 'leaf')
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
      toast.success('Profile saved!')
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
      const appOrigin = (typeof window !== 'undefined' ? window.location.origin : '').replace(/\/$/, '')
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${appOrigin}/auth/callback?type=recovery&next=/reset-password`,
      })
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
      toast.success('Data exported!')
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
      toast.success('Progress reset. Fresh start, adventurer!')
      setShowReset(false)
      setResetInput('')
      refetch()
    } catch {
      toast.error('Reset failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFAF7]">
        <div className="text-center">
          <div className="flex justify-center mb-4 text-[#5B57F0]">
            <SettingsIcon className="w-10 h-10 animate-spin" />
          </div>
          <div className="text-sm text-[#8A857A]">Loading settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#FBFAF7] text-[#232019]">
      <Sidebar
        userAvatar={profile?.avatar_emoji ?? 'leaf'}
        userName={profile?.display_name ?? 'Adventurer'}
        userLevel={profile?.level ?? 1}
      />

      <main className="flex-1 overflow-y-auto" style={{ marginLeft: 240 }}>
        <div className="p-6 xl:p-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-1 font-display text-[#232019]">Settings</h1>
            <p className="text-sm text-[#6E6A61]">Manage your account preferences and customize your journey.</p>
          </motion.div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <motion.section
              className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <User size={18} className="text-[#5B57F0]" />
                <h2 className="font-bold font-display text-lg text-[#232019]">Profile</h2>
              </div>

              {/* Avatar picker */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2 text-[#6E6A61]">Avatar Icon</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatarEmoji(emoji)}
                      className={`p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center border ${
                        avatarEmoji === emoji
                          ? 'bg-[#EDECFD] border-[#5B57F0] text-[#5B57F0] scale-110 shadow-sm'
                          : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#6E6A61] hover:text-[#232019] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      <DynamicIcon name={emoji} size={22} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Display name */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2 text-[#6E6A61]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] focus:bg-white focus:border-[#5B57F0]"
                />
              </div>

              {/* Bio */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2 text-[#6E6A61]">Bio / Tagline</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 100))}
                  rows={2}
                  maxLength={100}
                  placeholder="e.g. Building the best version of myself, one quest at a time."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019] focus:bg-white focus:border-[#5B57F0]"
                />
                <div className="text-right text-xs mt-1 text-[#8A857A]">{bio.length}/100</div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#5B57F0] text-white shadow-sm hover:bg-[#4D49E0] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </motion.section>

            {/* Notifications */}
            <motion.section
              className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Bell size={18} className="text-[#3B82F6]" />
                <h2 className="font-bold font-display text-lg text-[#232019]">Notifications</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Party member completes a quest', key: 'party_complete' },
                  { label: 'Someone reacts to my completion', key: 'reaction_received' },
                  { label: 'Achievement earned', key: 'achievement_earned' },
                  { label: 'Weekly report (every Sunday)', key: 'weekly_report' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-[#6E6A61]">{item.label}</span>
                    <div
                      className="w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 bg-[#10B981]"
                      onClick={() => toast.info('Notification settings updated!')}
                    >
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Account */}
            <motion.section
              className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Shield size={18} className="text-[#10B981]" />
                <h2 className="font-bold font-display text-lg text-[#232019]">Account</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#6E6A61]">Email Address</label>
                  <div className="text-sm px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] text-[#232019]">
                    {userEmail || 'Loading...'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white border border-[#EAE6DD] text-[#232019] hover:border-[#5B57F0] hover:text-[#5B57F0] shadow-sm"
                  >
                    <KeyRound size={15} />
                    Change Password
                  </button>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white border border-[#EAE6DD] text-[#232019] hover:border-[#10B981] hover:text-[#10B981] shadow-sm"
                  >
                    <Download size={15} />
                    Export My Data
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Appearance */}
            <motion.section
              className="p-6 rounded-2xl border border-[#EAE6DD] bg-white shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h2 className="font-bold font-display text-lg mb-3 flex items-center gap-2 text-[#232019]">
                <Palette size={18} className="text-[#5B57F0]" />
                <span>Appearance</span>
              </h2>
              <div className="py-6 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#EAE6DD]">
                <Palette size={24} className="text-[#5B57F0] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#6E6A61]">Light Creative Theme Active</p>
                <p className="text-xs text-[#8A857A] mt-0.5">Additional theme variations coming soon</p>
              </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.section
              className="p-6 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-rose-600" />
                <h2 className="font-bold font-display text-lg text-rose-600">Danger Zone</h2>
              </div>
              <p className="text-xs text-[#6E6A61] mb-4">
                Irreversible actions that will reset your account quest history and progress.
              </p>

              {!showReset ? (
                <button
                  onClick={() => setShowReset(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white shadow-sm"
                >
                  Reset Progress
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-sm">
                  <p className="text-sm mb-3 flex items-start gap-1.5 text-rose-600 font-medium">
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>
                      This will clear all XP, levels, stats, and completions. Your quests will remain. Type <strong>RESET</strong> to confirm.
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type RESET"
                      value={resetInput}
                      onChange={e => setResetInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-lg text-sm outline-none bg-[#FAF8F5] border border-rose-300 text-[#232019] focus:bg-white focus:border-rose-500"
                    />
                    <button
                      onClick={handleResetProgress}
                      disabled={resetInput !== 'RESET'}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        resetInput === 'RESET'
                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm cursor-pointer'
                          : 'bg-rose-100 text-rose-300 cursor-not-allowed'
                      }`}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => { setShowReset(false); setResetInput('') }}
                      className="px-4 py-2 rounded-lg text-sm transition-all bg-white border border-[#EAE6DD] text-[#6E6A61] hover:text-[#232019]"
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

