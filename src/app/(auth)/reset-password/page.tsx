'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react'
import confetti from 'canvas-confetti'

function calculatePasswordStrength(pass: string) {
  let score = 0
  if (pass.length >= 6) score += 1
  if (pass.length >= 10) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass)) score += 1
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1

  if (score <= 1) return { label: 'Weak', color: '#EF4444', percent: 25 }
  if (score <= 3) return { label: 'Good', color: '#F59E0B', percent: 65 }
  return { label: 'Strong', color: '#10B981', percent: 100 }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Verify auth session on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setHasValidSession(true)
        } else {
          // Listen for password recovery auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange((event: string, s: unknown) => {
            if (event === 'PASSWORD_RECOVERY' || s) {
              setHasValidSession(true)
            }
          })
          return () => {
            authListener.subscription.unsubscribe()
          }
        }
      } catch {
        setHasValidSession(false)
      } finally {
        setVerifyingSession(false)
      }
    }
    checkAuthSession()
  }, [supabase.auth])

  const strength = calculatePasswordStrength(password)

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateErr) throw updateErr

      setIsSuccess(true)
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5B57F0', '#10B981', '#F59E0B'],
      })

      // Auto navigate to dashboard after 2.5s
      setTimeout(() => {
        router.replace('/dashboard')
        router.refresh()
      }, 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password. Please request a new link.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#FBFAF7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#5B57F0', fontWeight: 600 }}>
          <Loader2 size={20} className="animate-spin" />
          <span>Verifying security authorization...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FBFAF7',
        color: '#232019',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 440, width: '100%', position: 'relative', zIndex: 10 }}>
        {/* Back button */}
        <div style={{ marginBottom: 20 }}>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#6E6A61',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #EAE6DD',
            padding: '36px 32px',
            boxShadow: '0 20px 50px rgba(35, 32, 25, 0.06)',
          }}
        >
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0', color: '#232019' }}>
                Passcode Secured!
              </h2>
              <p style={{ fontSize: 14, color: '#6E6A61', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                Your character password has been updated. Routing you into the realm...
              </p>
              <button
                onClick={() => {
                  router.replace('/dashboard')
                  router.refresh()
                }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 999,
                  background: '#5B57F0',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue to Dashboard &rarr;
              </button>
            </div>
          ) : !hasValidSession ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: '#232019' }}>
                Recovery Link Expired
              </h2>
              <p style={{ fontSize: 14, color: '#6E6A61', lineHeight: 1.5, margin: '0 0 22px 0' }}>
                This recovery session has expired or is invalid. Please request a new password reset link.
              </p>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 999,
                  background: '#5B57F0',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #5B57F0, #8A86FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: '0 6px 16px rgba(91, 87, 240, 0.25)',
                    color: '#FFFFFF',
                  }}
                >
                  <KeyRound size={22} />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#232019', margin: '0 0 6px 0' }}>
                  Set New Password
                </h1>
                <p style={{ fontSize: 13.5, color: '#6E6A61', margin: 0 }}>
                  Enter your new adventurer passcode below
                </p>
              </div>

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* New Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#232019', marginBottom: 6 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        borderRadius: 12,
                        border: '1px solid #EAE6DD',
                        background: '#FFFFFF',
                        color: '#232019',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
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

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: '#8A857A' }}>Strength:</span>
                        <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
                      </div>
                      <div style={{ height: 4, width: '100%', background: '#EAE6DD', borderRadius: 2, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${strength.percent}%`,
                            background: strength.color,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#232019', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-type new password"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        borderRadius: 12,
                        border: '1px solid #EAE6DD',
                        background: '#FFFFFF',
                        color: '#232019',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
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
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: '#FEF2F2',
                        border: '1px solid #F87171',
                        color: '#DC2626',
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

                {/* Submit button */}
                <button
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
                    marginTop: 6,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
