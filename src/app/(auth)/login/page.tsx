'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Swords, AlertTriangle, Sparkles, ArrowLeft, Mail, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid login credentials')) return 'Email or password is incorrect.'
  if (normalized.includes('email not confirmed')) return 'Please confirm your email first, or resend the activation link below.'
  if (normalized.includes('already registered')) return 'An account with this email already exists. Try signing in instead.'
  if (normalized.includes('password should be')) return 'Password must be at least 6 characters long.'
  if (normalized.includes('rate limit') || normalized.includes('over_email_send_rate_limit')) {
    return 'Email rate limit reached. Please wait a minute before requesting another link.'
  }
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
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Resend confirmation link state & cooldown
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResendConfirmation = useCallback(async (targetEmail?: string) => {
    const emailToUse = (targetEmail || unconfirmedEmail || email).trim()
    if (!emailToUse) {
      setError('Please enter your email address to resend confirmation.')
      return
    }

    setResendLoading(true)
    setError(null)
    try {
      const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${appOrigin}/auth/callback`,
        },
      })
      if (resendErr) throw resendErr

      setResendCooldown(60)
      setNotice(`A fresh activation link was sent to ${emailToUse}. Please check your Inbox and Spam folder.`)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setResendLoading(false)
    }
  }, [email, supabase.auth, unconfirmedEmail])

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!email.trim()) {
      setError('Please enter your registered adventurer email.')
      return
    }

    setLoading(true)
    try {
      let sentSuccess = false
      let msg = `Password reset scroll dispatched to ${email.trim()}! Check your Inbox & Spam folder.`

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })

        if (res.ok) {
          const result = await res.json()
          if (result.success) {
            sentSuccess = true
            if (result.message) msg = result.message
          }
        }
      } catch {
        // Fallback to client Supabase reset below
      }

      // If API route was skipped or returned fallback, execute client SDK reset
      if (!sentSuccess) {
        const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${appOrigin}/auth/callback?type=recovery&next=/reset-password`,
        })
        if (resetErr) throw resetErr
      }

      setResendCooldown(60)
      setNotice(msg)
    } catch (err: unknown) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'forgot') {
      return handleForgotPassword(e)
    }

    setError(null)
    setNotice(null)
    setLoading(true)

    try {
      const appOrigin = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, '')

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setUnconfirmedEmail(email.trim())
          }
          throw error
        }
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
            data: { display_name: displayName.trim() || 'Adventurer' },
            emailRedirectTo: `${appOrigin}/auth/callback`,
          },
        })
        if (error) throw error

        // If session was returned immediately (Confirm email is OFF in Supabase)
        if (data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.user!.id)
            .maybeSingle()

          if (profile?.onboarding_completed) {
            router.replace('/dashboard')
          } else {
            router.replace('/onboarding')
          }
          router.refresh()
          return
        }

        // Attempt instant sign in (handles auto-confirm setups)
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (!signInErr && signInData?.session) {
          router.replace('/onboarding')
          router.refresh()
          return
        }

        // Email confirmation is required by Supabase
        setUnconfirmedEmail(email.trim())
        setNotice(`Account registered! An activation link was sent to ${email.trim()}. Please check your Inbox & Spam folder.`)
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
        background: '#FBFAF7',
        color: '#232019',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Warm Background Blobs */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #EDECFD 0%, rgba(237, 236, 253, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #F0EEE6 0%, rgba(240, 238, 230, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Back Link */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#6E6A61',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
          >
            <ArrowLeft size={15} />
            <span>Back to overview</span>
          </Link>
        </div>

        {/* White Centered Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #EAE6DD',
            padding: '36px 32px',
            boxShadow: '0 24px 60px rgba(35, 32, 25, 0.08)',
          }}
        >
          {/* Logo & Heading */}
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #5B57F0, #8A86FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 6px 16px rgba(91, 87, 240, 0.25)',
              }}
            >
              <Swords size={22} color="#FFFFFF" strokeWidth={1.8} />
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#232019',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              Life RPG OS
            </h1>
            <p style={{ fontSize: 14, color: '#6E6A61', margin: 0 }}>
              {mode === 'login'
                ? 'Your adventure continues here'
                : mode === 'signup'
                ? 'Create your adventurer character'
                : 'Enter your email to receive recovery instructions'}
            </p>
          </div>

          {/* Underline Tabs for Sign In / Create Account (Hidden in forgot mode) */}
          {mode !== 'forgot' ? (
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #EAE6DD',
                marginBottom: 22,
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
                      setNotice(null)
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #5B57F0' : '2px solid transparent',
                      color: isActive ? '#5B57F0' : '#6E6A61',
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
                color: '#5B57F0',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <KeyRound size={16} />
              <span>Password Recovery</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="display-name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#232019',
                      marginBottom: 6,
                    }}
                  >
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={mode === 'signup'}
                    placeholder="Adventurer Name"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 12,
                      border: '1px solid #EAE6DD',
                      background: '#FFFFFF',
                      color: '#232019',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B57F0')}
                    onBlur={(e) => (e.target.style.borderColor = '#EAE6DD')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#232019',
                  marginBottom: 6,
                }}
              >
                Email
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
                  borderRadius: 12,
                  border: '1px solid #EAE6DD',
                  background: '#FFFFFF',
                  color: '#232019',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#5B57F0')}
                onBlur={(e) => (e.target.style.borderColor = '#EAE6DD')}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#232019',
                    marginBottom: 6,
                  }}
                >
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
                      borderRadius: 12,
                      border: '1px solid #EAE6DD',
                      background: '#FFFFFF',
                      color: '#232019',
                      fontSize: 14,
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#5B57F0')}
                    onBlur={(e) => (e.target.style.borderColor = '#EAE6DD')}
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
                      color: '#A19C90',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {mode === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setError(null)
                        setNotice(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#5B57F0',
                        fontSize: 12.5,
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm-password"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#232019',
                      marginBottom: 6,
                    }}
                  >
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
                        borderRadius: 12,
                        border: '1px solid #EAE6DD',
                        background: '#FFFFFF',
                        color: '#232019',
                        fontSize: 14,
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#5B57F0')}
                      onBlur={(e) => (e.target.style.borderColor = '#EAE6DD')}
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
                        color: '#A19C90',
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

            {/* Error message */}
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#FEF2F2',
                    border: '1px solid #F87171',
                    color: '#DC2626',
                    fontSize: 13,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{error}</span>
                  </div>
                  {unconfirmedEmail && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleResendConfirmation(unconfirmedEmail)}
                        disabled={resendLoading || resendCooldown > 0}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                          opacity: resendCooldown > 0 ? 0.7 : 1,
                        }}
                      >
                        {resendLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        <span>
                          {resendCooldown > 0
                            ? `Resend Link in ${resendCooldown}s`
                            : 'Resend Confirmation Email'}
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notice / Activation message */}
            <AnimatePresence>
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    color: '#166534',
                    fontSize: 13,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Mail size={17} style={{ flexShrink: 0, marginTop: 2, color: '#16A34A' }} />
                    <div style={{ lineHeight: 1.45 }}>{notice}</div>
                  </div>

                  <div
                    style={{
                      background: '#DCFCE7',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#15803D',
                    }}
                  >
                    💡 <strong>Tip:</strong> If it hasn&apos;t arrived in 1-2 minutes, check your <strong>Spam / Junk</strong> folder or click below.
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleResendConfirmation(unconfirmedEmail || email)}
                      disabled={resendLoading || resendCooldown > 0}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        borderRadius: 999,
                        background: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                        opacity: resendCooldown > 0 ? 0.75 : 1,
                      }}
                    >
                      {resendLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      <span>
                        {resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend Verification Link'}
                      </span>
                    </button>

                    {mode === 'signup' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login')
                          setError(null)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#166534',
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        Already confirmed? Sign in
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Submit Button */}
            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 999,
                background: '#5B57F0',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(91, 87, 240, 0.25)',
                transition: 'all 0.15s ease',
                marginTop: 6,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#4A46E0'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#5B57F0'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    {mode === 'login'
                      ? 'Signing in...'
                      : mode === 'signup'
                      ? 'Creating account...'
                      : 'Dispatching reset link...'}
                  </span>
                </>
              ) : mode === 'login' ? (
                <>
                  <Swords size={16} />
                  <span>Enter the Realm</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <Sparkles size={16} />
                  <span>Begin Adventure</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Dispatch Reset Link</span>
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setNotice(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6E6A61',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: 4,
                  textDecoration: 'underline',
                }}
              >
                &larr; Back to Sign In
              </button>
            )}
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '20px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#EAE6DD' }} />
            <span style={{ fontSize: 12, color: '#A19C90' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#EAE6DD' }} />
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
              background: '#FFFFFF',
              color: '#232019',
              border: '1px solid #EAE6DD',
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
              e.currentTarget.style.borderColor = '#232019'
              e.currentTarget.style.background = '#FBFAF7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#EAE6DD'
              e.currentTarget.style.background = '#FFFFFF'
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
