'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        })
        if (error) throw error

        if (data.user) {
          // Check onboarding status
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single()

          if (profile?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#08080F' }}>
      {/* Purple grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 58, 237, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#7C3AED' }} />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl p-8 border"
          style={{
            background: '#13131F',
            borderColor: '#7C3AED66',
            boxShadow: '0 0 40px #7C3AED22, 0 0 80px #7C3AED11',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">⚔️</div>
            <h1 className="font-display text-3xl font-bold" style={{ color: '#F59E0B', fontFamily: 'Oxanium, sans-serif' }}>
              Life RPG OS
            </h1>
            <p className="mt-2" style={{ color: '#9B99B8' }}>
              {mode === 'login' ? 'Your adventure continues here' : 'Your adventure begins here'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg mb-6 p-1" style={{ background: '#0F0F1A' }}>
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize"
                style={{
                  background: mode === m ? '#7C3AED' : 'transparent',
                  color: mode === m ? '#F1F0FF' : '#9B99B8',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm mb-1" style={{ color: '#9B99B8' }}>
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={mode === 'signup'}
                    placeholder="Adventurer Name"
                    className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200 focus:ring-2"
                    style={{
                      background: '#0F0F1A',
                      border: '1px solid #1E1E35',
                      color: '#F1F0FF',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                    onBlur={(e) => (e.target.style.borderColor = '#1E1E35')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#9B99B8' }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hero@example.com"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
                style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                onBlur={(e) => (e.target.style.borderColor = '#1E1E35')}
              />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: '#9B99B8' }}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-lg outline-none transition-all duration-200"
                  style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                  onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.target.style.borderColor = '#1E1E35')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#5C5A7A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#9B99B8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm mb-1" style={{ color: '#9B99B8' }}>Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={mode === 'signup'}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-lg outline-none transition-all duration-200"
                      style={{ background: '#0F0F1A', border: '1px solid #1E1E35', color: '#F1F0FF' }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#1E1E35')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#5C5A7A' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#9B99B8')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#5C5A7A')}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-lg text-sm"
                  style={{ background: '#EF444422', border: '1px solid #EF444444', color: '#EF4444' }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? '#5B21B6' : '#7C3AED',
                color: '#F1F0FF',
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#6D28D9' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#7C3AED' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? '⚔️ Enter the Realm' : '🌟 Begin Adventure'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: '#1E1E35' }} />
            <span className="text-xs" style={{ color: '#5C5A7A' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#1E1E35' }} />
          </div>

          {/* Google OAuth */}
          <button
            id="google-btn"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3"
            style={{
              background: '#0F0F1A',
              border: '1px solid #2E2E50',
              color: '#F1F0FF',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7C3AED66')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2E2E50')}
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  )
}
