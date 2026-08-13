import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Life RPG OS',
  description: 'Privacy Policy for Life RPG OS application.',
}

export default function PrivacyPage() {
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
        Privacy Policy
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
          1. Information We Collect
        </h2>
        <p style={{ color: '#9B99B8' }}>
          We collect information you provide directly to us when creating an account, such as your email address, display name, custom avatar preferences, habit titles, quest completion timestamps, and character statistics.
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
          2. How We Use Your Data
        </h2>
        <p style={{ color: '#9B99B8' }}>
          Your data is used strictly to provide and improve the Life RPG OS service: calculating your XP, updating stat progression, powering your AI Growth Coach recommendations, and managing party/couple accountability features.
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
          3. What We NEVER Do
        </h2>
        <p style={{ color: '#9B99B8' }}>
          We NEVER sell your personal data, habit tracking history, or private notes to third parties. We do not use advertising networks that track you across websites.
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
          4. Your Privacy Rights
        </h2>
        <p style={{ color: '#9B99B8' }}>
          You retain full ownership of your data. You may export your habit records, update your profile settings, or request permanent deletion of your account and all associated records at any time.
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
          5. Contact Us
        </h2>
        <p style={{ color: '#9B99B8' }}>
          If you have questions regarding this Privacy Policy, please contact our team at{' '}
          <a href="mailto:privacy@life-rpg-os.com" style={{ color: '#9F67FF' }}>
            privacy@life-rpg-os.com
          </a>.
        </p>
      </section>
    </div>
  )
}
