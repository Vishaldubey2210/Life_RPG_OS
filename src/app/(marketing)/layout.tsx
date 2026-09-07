'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Swords, Menu, X, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      style={{
        background: '#070710',
        color: '#F3F4F6',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
      }}
    >
      {/* Top Banner: Made for India */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.2), rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))',
          borderBottom: '1px solid rgba(124, 58, 237, 0.3)',
          padding: '6px 16px',
          textAlign: 'center',
          fontSize: 12.5,
          color: '#D1D5DB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>🇮🇳</span>
        <span style={{ fontWeight: 600, color: '#F59E0B' }}>Life RPG OS India:</span>
        <span>Gamify your JEE, UPSC, Coding & Fitness goals. Free forever.</span>
        <Link
          href="/login"
          style={{
            color: '#A78BFA',
            fontWeight: 600,
            textDecoration: 'underline',
            marginLeft: 4,
          }}
        >
          Claim Demo Hero →
        </Link>
      </div>

      {/* Sticky Top Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(7, 7, 16, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(35, 35, 62, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.5)',
              }}
            >
              <Swords size={20} color="#FFFFFF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 800,
                  fontSize: 19,
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(135deg, #FFFFFF, #E0E7FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LIFE RPG OS
              </span>
              <span style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>
                Character Progression Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: 'flex', gap: 32, alignItems: 'center' }}
            className="hidden-mobile"
          >
            <a
              href="#features"
              style={{
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              Features
            </a>
            <a
              href="#skill-tree"
              style={{
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              Skill Trees
            </a>
            <a
              href="#how-it-works"
              style={{
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              How it works
            </a>
            <a
              href="#pricing"
              style={{
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              Pricing (₹ INR)
            </a>
            <a
              href="#faq"
              style={{
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F3F4F6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#D1D5DB',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 14px',
                borderRadius: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#D1D5DB')}
            >
              Login
            </Link>
            <Link
              href="/login"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 22px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
                border: '1px solid rgba(167, 139, 250, 0.4)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 0 28px rgba(124, 58, 237, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.4)'
              }}
            >
              <Zap size={15} className="text-amber-400" />
              <span>Enter Realm</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#F3F4F6',
                cursor: 'pointer',
                display: 'none',
                padding: 6,
              }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            style={{
              background: '#0D0E1C',
              borderTop: '1px solid #23233E',
              padding: '18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              Features
            </a>
            <a href="#skill-tree" onClick={() => setMobileOpen(false)} style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              Skill Trees
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              Pricing (₹ INR)
            </a>
            <a href="#faq" onClick={() => setMobileOpen(false)} style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              FAQ
            </a>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
