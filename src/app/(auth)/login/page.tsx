'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Swords, AlertTriangle, Sparkles, Zap, UserCheck, ArrowLeft } from 'lucide-react'

type Mode = 'login' | 'signup'

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Email or password is incorrect.'
  if (normalized.includes('email not confirmed')) return 'Please confirm your email first, then sign in.'
  if (normalized.includes('already registered')) return 'An account with this email already exists. Try signing in instead.'
  if (normalized.includes('password should be')) return 'Password must be at least 6 characters long.'
  if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    return 'Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and confirm the Supabase project is active.'
  }
  return message
}

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
  const [demoLoading, setDemoLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleDemoLogin() {
    setDemoLoading(true)
    setError(null)
    setNotice(null)
    const demoEmail = 'demo@liferpg.os'
    const demoPassword = 'demouser123'
    setEmail(demoEmail)
    setPassword(demoPassword)
    setMode('login')

    try {
      // 1. Attempt login with demo credentials
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (!signInErr && signInData.user) {
        router.replace('/dashboard')
        router.refresh()
        return
      }

      // 2. If account doesn't exist yet, auto-create it
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: { display_name: 'Aarav (Demo Hero)' },
        },
      })

      if (signUpErr && !signUpErr.message.toLowerCase().includes('already registered')) {
        throw signUpErr
      }

      if (signUpData?.session) {
        router.replace('/dashboard')
        router.refresh()
        return
      }

      // 3. Re-try sign in
      const { error: retryErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (retryErr) {
        throw retryErr
      }

      router.replace('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(friendlyAuthError(err))
    } finally {
      setDemoLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)

    try {
      const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        router.replace('/dashboard')
        router.refresh()
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${appOrigin}/auth/callback`,
          },
        })
        if (error) throw error

        if (!data.session) {
          setNotice('Account created. Check your inbox to confirm your email, then sign in.')
          return
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user.id)
            .single()

          if (profile?.onboarding_completed) {
            router.replace('/dashboard')
          } else {
            router.replace('/onboarding')
          }
          router.refresh()
        }
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    setNotice(null)
    try {
      const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appOrigin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(friendlyAuthError(err))
      setGoogleLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070710',
        color: '#F3F4F6',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Neon Grid / Glows */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Back Link */}
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#9CA3AF',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            <ArrowLeft size={15} />
            <span>Back to main overview</span>
          </Link>
        </div>

        {/* Dark Glowing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(145deg, #121324, #0B0C18)',
            borderRadius: 22,
            border: '1px solid rgba(124, 58, 237, 0.4)',
            padding: '36px 30px',
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.2), 0 20px 40px rgba(0,0,0,0.7)',
          }}
        >
          {/* Logo & Heading */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
              }}
            >
              <Swords size={24} color="#FFFFFF" />
            </div>
            <h1
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                margin: '0 0 6px 0',
              }}
            >
              LIFE RPG OS INDIA
            </h1>
            <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: 0 }}>
              {mode === 'login' ? 'Your campaign continues here' : 'Begin your real-life campaign'}
            </p>
          </div>

          {/* 1-Click Instant Demo Login Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(245, 158, 11, 0.15))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 22,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 700, fontSize: 13 }}>
                <Zap size={15} />
                <span>Instant Demo Access</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#070710',
                  background: '#F59E0B',
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                1-Click
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: '#D1D5DB', margin: '0 0 10px 0', lineHeight: 1.4 }}>
              Directly explore the full character sheet & daily habits with a pre-loaded hero account.
            </p>
            <button
              id="demo-login-btn"
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#070710',
                border: 'none',
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 13.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              {demoLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Entering Realm...</span>
                </>
              ) : (
                <>
                  <UserCheck size={15} />
                  <span>Login with Demo Hero (1-Click)</span>
                </>
              )}
            </button>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#9CA3AF',
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              demo@liferpg.os • demouser123
            </div>
          </div>

          {/* Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#090A14',
              borderRadius: 10,
              padding: 4,
              marginBottom: 20,
              border: '1px solid #1F2038',
            }}
          >
            {(['login', 'signup'] as Mode[]).map((m) => {
              const isActive = mode === m
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m)
                    setError(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 8,
                    background: isActive ? '#7C3AED' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                    border: 'none',
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Create Hero'}
                </button>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#D1D5DB', marginBottom: 6 }}>
                    Hero Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={mode === 'signup'}
                    placeholder="e.g. Aarav / Warrior"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid #23233E',
                      background: '#090A14',
                      color: '#FFFFFF',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                    onBlur={(e) => (e.target.style.borderColor = '#23233E')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#D1D5DB', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hero@example.com"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid #23233E',
                  background: '#090A14',
                  color: '#FFFFFF',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                onBlur={(e) => (e.target.style.borderColor = '#23233E')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#D1D5DB', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: 10,
                    border: '1px solid #23233E',
                    background: '#090A14',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                  onBlur={(e) => (e.target.style.borderColor = '#23233E')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#D1D5DB', marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={mode === 'signup'}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        borderRadius: 10,
                        border: '1px solid #23233E',
                        background: '#090A14',
                        color: '#FFFFFF',
                        fontSize: 14,
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
                      onBlur={(e) => (e.target.style.borderColor = '#23233E')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#F87171',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notice Message */}
            <AnimatePresence>
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34D399',
                    fontSize: 13,
                  }}
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#FFFFFF',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                fontSize: 14.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.15s ease',
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 0 28px rgba(124, 58, 237, 0.6)'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.4)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating hero...'}</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <Swords size={16} />
                  <span>Enter the Realm</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Begin Adventure</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '18px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#23233E' }} />
            <span style={{ fontSize: 12, color: '#6B7280' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#23233E' }} />
          </div>

          {/* Google OAuth Button */}
          <button
            id="google-btn"
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '11px 20px',
              borderRadius: 999,
              background: '#090A14',
              color: '#FFFFFF',
              border: '1px solid #23233E',
              fontSize: 13.5,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#23233E'
            }}
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
            <span>Continue with Google</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
