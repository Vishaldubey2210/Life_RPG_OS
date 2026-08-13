'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#08080F', color: '#F1F0FF' }}>
      {/* Sticky Navbar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,8,15,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #1E1E35',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
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
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: '#F1F0FF',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚔️</span> Life RPG OS
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: 'flex', gap: 32, alignItems: 'center' }}
            className="hidden-mobile"
          >
            <a
              href="#features"
              style={{ color: '#9B99B8', textDecoration: 'none', fontSize: 14 }}
            >
              Features
            </a>
            <a
              href="#pricing"
              style={{ color: '#9B99B8', textDecoration: 'none', fontSize: 14 }}
            >
              Pricing
            </a>
            <a
              href="#faq"
              style={{ color: '#9B99B8', textDecoration: 'none', fontSize: 14 }}
            >
              FAQ
            </a>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                color: '#9B99B8',
                textDecoration: 'none',
                fontSize: 14,
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #2E2E50',
              }}
            >
              Login
            </Link>
            <Link
              href="/login"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
                color: 'white',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 20px',
                borderRadius: 8,
                fontFamily: "'Oxanium', sans-serif",
              }}
            >
              Start Free ⚔️
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#F1F0FF',
                cursor: 'pointer',
                fontSize: 20,
                display: 'none',
              }}
              className="show-mobile"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            style={{
              background: '#0F0F1A',
              borderTop: '1px solid #1E1E35',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <a href="#features" style={{ color: '#9B99B8', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#pricing" style={{ color: '#9B99B8', textDecoration: 'none' }}>
              Pricing
            </a>
            <a href="#faq" style={{ color: '#9B99B8', textDecoration: 'none' }}>
              FAQ
            </a>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>

      {children}
    </div>
  )
}
