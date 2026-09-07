'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Swords, Menu, X, ArrowRight } from 'lucide-react'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div
      style={{
        background: '#FBFAF7',
        color: '#232019',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
      }}
    >
      {/* Sticky Top Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(251, 250, 247, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #EAE6DD',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
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
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #5B57F0, #8A86FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(91, 87, 240, 0.25)',
              }}
            >
              <Swords size={16} color="#FFFFFF" strokeWidth={1.8} />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: '-0.02em',
                color: '#232019',
              }}
            >
              Life RPG OS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: 'flex', gap: 32, alignItems: 'center' }}
            className="hidden-mobile"
          >
            <a
              href="#features"
              style={{
                color: '#6E6A61',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{
                color: '#6E6A61',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
            >
              How it works
            </a>
            <a
              href="#pricing"
              style={{
                color: '#6E6A61',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
            >
              Pricing
            </a>
            <a
              href="#faq"
              style={{
                color: '#6E6A61',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
            >
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#6E6A61',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 12px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#232019')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6E6A61')}
            >
              Sign in
            </Link>
            <Link
              href="/login"
              style={{
                background: '#232019',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                padding: '9px 20px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(35, 32, 25, 0.12)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#38342C'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#232019'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>Get started</span>
              <ArrowRight size={14} />
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#232019',
                cursor: 'pointer',
                display: 'none',
                padding: 6,
              }}
              className="show-mobile"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            style={{
              background: '#FFFFFF',
              borderTop: '1px solid #EAE6DD',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Pricing
            </a>
            <a href="#faq" onClick={() => setMobileOpen(false)} style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
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
