import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Life RPG OS',
  description: 'Terms of Service for Life RPG OS application.',
}

export default function TermsPage() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 24px 100px',
        color: '#F1F0FF',
        lineHeight: 1.8,
      }}
    >
      <h1
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 36,
          fontWeight: 800,
          marginBottom: 12,
        }}
      >
        Terms of Service
      </h1>
      <p style={{ color: '#9B99B8', fontSize: 14, marginBottom: 40 }}>
        Last updated: August 14, 2026
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 20,
            color: '#7C3AED',
            marginBottom: 12,
          }}
        >
          1. Acceptance of Terms
        </h2>
        <p style={{ color: '#9B99B8' }}>
          By creating an account or accessing Life RPG OS, you agree to comply with these Terms of Service. You must be at least 13 years old to use this platform.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 20,
            color: '#7C3AED',
            marginBottom: 12,
          }}
        >
          2. Platform Usage & Rules
        </h2>
        <p style={{ color: '#9B99B8' }}>
          Life RPG OS is designed for self-improvement and positive habit tracking. You agree not to misuse the platform, attempt unauthorized API access, or post abusive or harmful content in multiplayer party rooms or community leaderboards.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 20,
            color: '#7C3AED',
            marginBottom: 12,
          }}
        >
          3. Account Responsibility
        </h2>
        <p style={{ color: '#9B99B8' }}>
          You are responsible for maintaining the confidentiality of your credentials. We reserve the right to suspend or terminate accounts that violate community standards or abuse platform resources.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 20,
            color: '#7C3AED',
            marginBottom: 12,
          }}
        >
          4. Service Availability & Changes
        </h2>
        <p style={{ color: '#9B99B8' }}>
          We continuously update and enhance Life RPG OS. While we strive for 99.9% uptime, the service is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 20,
            color: '#7C3AED',
            marginBottom: 12,
          }}
        >
          5. Contact
        </h2>
        <p style={{ color: '#9B99B8' }}>
          For inquiries regarding these terms, reach out to{' '}
          <a href="mailto:support@life-rpg-os.com" style={{ color: '#9F67FF' }}>
            support@life-rpg-os.com
          </a>.
        </p>
      </section>
    </div>
  )
}
