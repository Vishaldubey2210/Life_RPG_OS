import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life RPG OS — Stop Tracking Habits. Start Leveling Up.',
  description:
    'Life RPG OS turns your daily habits into an RPG. Earn XP, unlock skills, compete with friends, and become the main character of your own story. Free to start.',
  keywords: [
    'habit tracker',
    'gamified habits',
    'life RPG',
    'XP system',
    'skill tree',
    'AI coach',
    'productivity',
    'self improvement',
  ],
  openGraph: {
    title: 'Life RPG OS — Gamify Your Life',
    description:
      'Earn XP for habits. Level up your stats. Compete with friends. The ultimate gamified life OS.',
    type: 'website',
    url: 'https://life-rpg-os.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life RPG OS — Stop Tracking. Start Leveling Up.',
    description: 'Turn your daily habits into an RPG. Free to start.',
  },
}

// Reusable stat bar for the animated character card
function StatBar({
  label,
  value,
  color,
  emoji,
}: {
  label: string
  value: number
  color: string
  emoji: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, width: 60, color: '#9B99B8', flexShrink: 0 }}>
        {emoji} {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 6,
          background: '#1E1E35',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: color,
            borderRadius: 3,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: '#F1F0FF', width: 24, textAlign: 'right' }}>
        {Math.round(value)}
      </span>
    </div>
  )
}

// Feature card component
function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string
  title: string
  desc: string
}) {
  return (
    <div
      className="feature-card"
      style={{
        background: '#13131F',
        border: '1px solid #2E2E50',
        borderRadius: 16,
        padding: 28,
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 16 }}>{emoji}</div>
      <h3
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: '#F1F0FF',
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      <p style={{ color: '#9B99B8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

// Testimonial card
function TestimonialCard({
  emoji,
  name,
  age,
  text,
}: {
  emoji: string
  name: string
  age: number
  text: string
}) {
  return (
    <div
      style={{
        background: '#13131F',
        border: '1px solid #2E2E50',
        borderRadius: 16,
        padding: 24,
        minWidth: 300,
        maxWidth: 340,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>{emoji}</span>
        <div>
          <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 14 }}>
            {name}, {age}
          </div>
          <div style={{ color: '#F59E0B', fontSize: 12 }}>⭐⭐⭐⭐⭐</div>
        </div>
      </div>
      <p style={{ color: '#9B99B8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  )
}

// Pricing card
function PricingCard({
  tier,
  name,
  price,
  period,
  description,
  features,
  notFeatures,
  ctaText,
  ctaHref,
  popular,
  borderColor,
  ctaStyle,
}: {
  tier: string
  name: string
  price: string
  period: string
  description?: string
  features: string[]
  notFeatures?: string[]
  ctaText: string
  ctaHref: string
  popular?: boolean
  borderColor: string
  ctaStyle: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: '#13131F',
        border: `2px solid ${borderColor}`,
        borderRadius: 20,
        padding: 32,
        position: 'relative',
        boxShadow: popular ? `0 0 30px ${borderColor}33` : 'none',
        flex: 1,
        minWidth: 280,
      }}
    >
      {popular && (
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#7C3AED',
            color: 'white',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Oxanium', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          ⭐ MOST POPULAR
        </div>
      )}
      <div
        style={{ color: '#9B99B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2 }}
      >
        {tier}
      </div>
      <div
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 24,
          fontWeight: 700,
          marginTop: 8,
        }}
      >
        {name}
      </div>
      <div style={{ marginTop: 12, marginBottom: 4 }}>
        <span
          style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 36, fontWeight: 800 }}
        >
          {price}
        </span>
        <span style={{ color: '#9B99B8', fontSize: 14 }}> {period}</span>
      </div>
      {description && (
        <div style={{ color: '#9B99B8', fontSize: 13, marginBottom: 20 }}>{description}</div>
      )}
      <div style={{ height: 1, background: '#2E2E50', margin: '20px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#22C55E', flexShrink: 0 }}>✅</span>
            <span style={{ color: '#F1F0FF', fontSize: 14 }}>{f}</span>
          </div>
        ))}
        {notFeatures?.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: '#5C5A7A', flexShrink: 0 }}>❌</span>
            <span style={{ color: '#5C5A7A', fontSize: 14 }}>{f}</span>
          </div>
        ))}
      </div>
      <a
        href={ctaHref}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '14px 24px',
          borderRadius: 12,
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          textDecoration: 'none',
          ...ctaStyle,
        }}
      >
        {ctaText}
      </a>
    </div>
  )
}

// FAQ item
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details
      style={{
        borderBottom: '1px solid #2E2E50',
        padding: '20px 0',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: '#F1F0FF',
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {q}
        <span style={{ color: '#7C3AED', flexShrink: 0 }}>▼</span>
      </summary>
      <p
        style={{
          marginTop: 12,
          color: '#9B99B8',
          lineHeight: 1.7,
          fontSize: 15,
        }}
      >
        {a}
      </p>
    </details>
  )
}

const testimonials = [
  {
    emoji: '💪',
    name: 'Arjun',
    age: 21,
    text: "I've tried 10 habit apps. This is the only one I open every morning without being forced to. The streak anxiety is REAL and I love it.",
  },
  {
    emoji: '🧠',
    name: 'Priya',
    age: 24,
    text: "Linked with my boyfriend in Couple Mode. Now we actually hold each other accountable. We haven't missed a day in 3 weeks.",
  },
  {
    emoji: '🔥',
    name: 'Rahul',
    age: 19,
    text: 'Got to Level 15 in 2 months. My INT stat going up every day because I read 20 pages. Sounds dumb but it WORKS.',
  },
  {
    emoji: '🌟',
    name: 'Sneha',
    age: 22,
    text: "The AI Coach told me I always skip habits on Wednesdays. It auto-reduced my Wednesday quest load. I haven't missed since.",
  },
  {
    emoji: '⚔️',
    name: 'Dev',
    age: 25,
    text: "My friend party keeps me honest. When they complete quests and I haven't — I feel the pressure. Best accountability system ever.",
  },
]

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Life RPG OS',
    applicationCategory: 'LifestyleApplication',
    description:
      'Gamified life operating system. Earn XP, level up stats, complete quests.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1000',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ============================================================
          SECTION 1: HERO
      ============================================================ */}
      <section
        id="hero"
        style={{
          minHeight: '100vh',
          background: '#08080F',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Star field background */}
        <div className="stars" aria-hidden="true" />
        {/* Purple nebula */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '80px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 60,
            position: 'relative',
            zIndex: 1,
            width: '100%',
          }}
          className="hero-inner"
        >
          {/* Left: 60% */}
          <div style={{ flex: '0 0 58%' }} className="hero-left">
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid #7C3AED',
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 13,
                color: '#9F67FF',
                marginBottom: 32,
                boxShadow: '0 0 16px rgba(124,58,237,0.3)',
              }}
            >
              ⚔️ Gamify Your Life — Free to Start
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#F1F0FF',
                marginBottom: 24,
              }}
            >
              Stop tracking habits.
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Start leveling up.
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                fontSize: 18,
                color: '#9B99B8',
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 500,
              }}
            >
              Life RPG OS turns your daily habits into an RPG. Earn XP, unlock skills,
              compete with friends, and become the main character of your own story.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link
                href="/login"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: 12,
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                className="btn-hero-primary"
              >
                Start Your Adventure — Free ⚔️
              </Link>
              <a
                href="#demo"
                style={{
                  color: '#F1F0FF',
                  padding: '16px 32px',
                  borderRadius: 12,
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: 'none',
                  border: '1px solid #2E2E50',
                  transition: 'border-color 0.2s',
                }}
              >
                Watch how it works →
              </a>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: -8 }}>
                {['⚔️', '🧙', '🏹', '🛡️', '🔮'].map((e, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 22,
                      background: '#1A1A2E',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #08080F',
                      marginLeft: i > 0 ? -10 : 0,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
              <div>
                <div style={{ color: '#F59E0B', fontSize: 14 }}>⭐⭐⭐⭐⭐</div>
                <div style={{ color: '#9B99B8', fontSize: 13 }}>
                  Loved by 1,000+ adventurers
                </div>
              </div>
            </div>
          </div>

          {/* Right: 40% — Animated Character Card */}
          <div
            style={{ flex: '0 0 38%', display: 'flex', justifyContent: 'center' }}
            className="hero-right"
          >
            <div
              className="character-card-float"
              style={{
                background: 'linear-gradient(135deg, #13131F, #1A1A2E)',
                border: '1px solid #2E2E50',
                borderRadius: 24,
                padding: 28,
                width: '100%',
                maxWidth: 340,
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.15)',
              }}
            >
              {/* Card header */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <div>
                  <div style={{ fontSize: 13, color: '#9B99B8' }}>Character</div>
                  <div
                    style={{
                      fontFamily: "'Oxanium', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    You
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      background: '#7C3AED',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontFamily: "'Oxanium', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    Level 12
                  </div>
                  <div style={{ color: '#F59E0B', fontSize: 13, marginTop: 4 }}>
                    ⚡ 2,840 XP
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 56 }}>⚔️</span>
              </div>

              {/* Stats */}
              <StatBar label="STR" value={75} color="#EF4444" emoji="💪" />
              <StatBar label="INT" value={82} color="#3B82F6" emoji="🧠" />
              <StatBar label="WIS" value={64} color="#8B5CF6" emoji="🧘" />
              <StatBar label="VIT" value={88} color="#22C55E" emoji="❤️" />
              <StatBar label="GOLD" value={55} color="#F59E0B" emoji="💰" />
              <StatBar label="CHA" value={70} color="#EC4899" emoji="🗣️" />

              {/* Streak */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 16,
                  padding: '10px 16px',
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: 12,
                }}
              >
                <span className="fire-pulse" style={{ fontSize: 20 }}>
                  🔥
                </span>
                <span
                  style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    color: '#F97316',
                  }}
                >
                  14 Day Streak
                </span>
              </div>

              {/* Completed quests */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Morning workout ✅', 'Read 20 pages ✅', 'Meditate 10min ✅'].map((q) => (
                  <div
                    key={q}
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      color: '#22C55E',
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>

              {/* Floating badges */}
              <div className="floating-badge-1" style={{ position: 'absolute', top: -16, right: -16 }}>
                <div
                  style={{
                    background: '#F59E0B',
                    color: '#08080F',
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "'Oxanium', sans-serif",
                    boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
                  }}
                >
                  +50 XP ⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SOCIAL PROOF / TESTIMONIALS
      ============================================================ */}
      <section
        id="testimonials"
        style={{ background: '#0F0F1A', padding: '80px 0', overflow: 'hidden' }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          <h2
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            pov: you started treating life like a game
          </h2>
          <p style={{ color: '#9B99B8', fontSize: 16 }}>What our users actually say</p>
        </div>

        {/* Marquee Row 1 → Left */}
        <div className="marquee-wrapper" style={{ marginBottom: 20 }}>
          <div className="marquee-track marquee-left" style={{ display: 'flex', gap: 20 }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* Marquee Row 2 → Right */}
        <div className="marquee-wrapper">
          <div className="marquee-track marquee-right" style={{ display: 'flex', gap: 20 }}>
            {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map(
              (t, i) => (
                <TestimonialCard key={i} {...t} />
              )
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: FEATURES
      ============================================================ */}
      <section
        id="features"
        style={{ background: '#08080F', padding: '100px 0' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 'clamp(24px, 3vw, 40px)',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Everything you need to become legendary
            </h2>
            <p style={{ color: '#9B99B8', fontSize: 18 }}>
              One app. Six stats. Infinite growth.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            <FeatureCard
              emoji="⚡"
              title="XP & Leveling System"
              desc="Every habit earns XP. Level up as you grow. Watch your character become more powerful in real time."
            />
            <FeatureCard
              emoji="🌳"
              title="Skill Tree"
              desc="Unlock new abilities as your stats grow. Visual progression that shows exactly how far you've come."
            />
            <FeatureCard
              emoji="🤖"
              title="AI Life Coach"
              desc="Your personal coach knows your patterns. Gets smarter every day. Gives advice based on YOUR data."
            />
            <FeatureCard
              emoji="👥"
              title="Party System"
              desc="Invite friends, partner, or family. See their progress live. React to their wins. Stay accountable."
            />
            <FeatureCard
              emoji="💑"
              title="Couple Mode"
              desc="Link with your partner. Share habits. Earn shared XP. Weekly couple report card."
            />
            <FeatureCard
              emoji="🏆"
              title="Leaderboard & Seasons"
              desc="Compete globally or with friends. 90-day seasons with exclusive legendary rewards for top players."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: HOW IT WORKS / DEMO
      ============================================================ */}
      <section
        id="demo"
        style={{ background: '#0F0F1A', padding: '100px 0' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 'clamp(24px, 3vw, 40px)',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Your adventure in 3 steps
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 0,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              {
                num: '01',
                icon: '⚔️',
                iconBg: '#7C3AED',
                title: 'Create Your Character',
                text: "Choose your goals, pick your avatar, and generate your starter quests automatically. Takes 2 minutes.",
                mini: '🎭🎯🏹',
              },
              {
                num: '02',
                icon: '✅',
                iconBg: '#22C55E',
                title: 'Complete Daily Quests',
                text: 'Check off habits to earn XP, fill your stat bars, and maintain your streak. Every action counts.',
                mini: '☐ Morning run ✅\n☐ Read 20 pages ✅',
              },
              {
                num: '03',
                icon: '⚡',
                iconBg: '#F59E0B',
                title: 'Level Up Your Life',
                text: 'Watch your character grow as you grow. Unlock skill tree nodes. Earn achievements. Compete with friends.',
                mini: '⚡ Level Up! → Level 13',
              },
            ].map((step, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 280 }}
              >
                <div
                  style={{
                    background: '#13131F',
                    border: '1px solid #2E2E50',
                    borderRadius: 20,
                    padding: 32,
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: step.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      margin: '0 auto 20px',
                      boxShadow: `0 0 24px ${step.iconBg}55`,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div
                    style={{ color: '#5C5A7A', fontSize: 12, fontWeight: 700, marginBottom: 8 }}
                  >
                    STEP {step.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Oxanium', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: '#9B99B8', fontSize: 14, lineHeight: 1.7 }}>{step.text}</p>
                  <div
                    style={{
                      marginTop: 20,
                      background: '#08080F',
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 20,
                    }}
                  >
                    {step.mini}
                  </div>
                </div>
                {i < 2 && (
                  <div
                    style={{
                      alignSelf: 'center',
                      color: '#7C3AED',
                      fontSize: 28,
                      padding: '0 8px',
                      flexShrink: 0,
                    }}
                    className="step-arrow"
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: STATS
      ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1A0A3E, #08080F)',
          padding: '80px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 40,
              textAlign: 'center',
            }}
          >
            {[
              { num: '10,000+', label: 'XP earned daily by our users' },
              { num: '85%', label: 'of users complete their quests daily' },
              { num: '3x', label: 'more consistent than traditional habit apps' },
              { num: '💑 500+', label: 'active couple pairs' },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 800,
                    color: '#F59E0B',
                    marginBottom: 8,
                  }}
                >
                  {stat.num}
                </div>
                <div style={{ color: '#9B99B8', fontSize: 14 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: PRICING
      ============================================================ */}
      <section
        id="pricing"
        style={{ background: '#08080F', padding: '100px 0' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 'clamp(24px, 3vw, 40px)',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Start free. Stay free.
            </h2>
            <p style={{ color: '#9B99B8', fontSize: 18 }}>
              Core features are free forever. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div
            style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}
          >
            <PricingCard
              tier="FREE"
              name="Adventurer"
              price="₹0"
              period="/ forever"
              features={[
                'Up to 5 daily quests',
                '3 life stats',
                'Basic XP + leveling',
                '7-day history',
                'Party (up to 3 members)',
              ]}
              notFeatures={[
                'AI Coach',
                'Full skill tree',
                'Advanced analytics',
                'Couple Mode',
              ]}
              ctaText="Start Free ⚔️"
              ctaHref="/login"
              borderColor="#2E2E50"
              ctaStyle={{
                border: '1px solid #2E2E50',
                color: '#F1F0FF',
                background: 'transparent',
              }}
            />
            <PricingCard
              tier="PRO"
              name="Hero"
              price="₹199"
              period="/ month"
              popular
              features={[
                'Unlimited quests',
                'All 6 stats + full skill tree',
                'AI Life Coach (unlimited)',
                'Full analytics (90 days)',
                'Couple Mode',
                'Party (up to 10 members)',
                'Custom quest icons + themes',
                'Weekly AI report',
              ]}
              ctaText="Start 7-Day Free Trial"
              ctaHref="/login"
              borderColor="#7C3AED"
              ctaStyle={{
                background: 'linear-gradient(135deg, #7C3AED, #9F67FF)',
                color: 'white',
                boxShadow: '0 0 24px rgba(124,58,237,0.4)',
              }}
            />
            <PricingCard
              tier="GUILD"
              name="Legend"
              price="₹499"
              period="/ month"
              description="For serious groups"
              features={[
                'Everything in Hero',
                'Guild creation (up to 50 members)',
                'Guild leaderboard',
                'Custom guild quests',
                'Guild analytics dashboard',
                'Priority AI Coach',
                'Exclusive legendary badge',
              ]}
              ctaText="Contact Us"
              ctaHref="mailto:hello@life-rpg-os.com"
              borderColor="#F59E0B"
              ctaStyle={{
                border: '1px solid #F59E0B',
                color: '#F59E0B',
                background: 'transparent',
              }}
            />
          </div>

          <p
            style={{
              textAlign: 'center',
              color: '#5C5A7A',
              fontSize: 14,
              marginTop: 32,
            }}
          >
            All prices in INR. Cancel anytime. No credit card for free plan.
          </p>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: FAQ
      ============================================================ */}
      <section
        id="faq"
        style={{ background: '#0F0F1A', padding: '100px 0' }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <h2
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 'clamp(24px, 3vw, 40px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 48,
            }}
          >
            Questions, answered
          </h2>

          <FaqItem
            q="Is this really free?"
            a="Yes. The free plan is genuinely useful — 5 quests, basic stats, party features. We'll never paywall core functionality."
          />
          <FaqItem
            q="How is this different from Habitica or other habit apps?"
            a="Three things: AI Coach that actually knows your patterns, Couple Mode for partners, and real-time party accountability. Also — we're built for 2025, not 2012."
          />
          <FaqItem
            q="Does the AI Coach actually help?"
            a="Yes. It reads your actual completion data and spots patterns you don't notice. Like: 'you always skip habits on Fridays — here's why and how to fix it.'"
          />
          <FaqItem
            q="Can my partner and I use it together?"
            a="Couple Mode links two accounts. You see each other's progress, share habits, earn shared XP, and get a weekly couple report card."
          />
          <FaqItem
            q="What happens if I miss a day?"
            a="Your streak resets and you lose some HP. But the comeback is always possible. Missing one day won't destroy your progress."
          />
          <FaqItem
            q="Is my data private?"
            a="Your habit data is private by default. You choose what to share with party members. We never sell data."
          />
        </div>
      </section>

      {/* ============================================================
          SECTION 8: FINAL CTA
      ============================================================ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #4C1D95)',
          padding: '100px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            color: 'white',
            marginBottom: 20,
          }}
        >
          Your adventure starts today.
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 18,
            marginBottom: 40,
            maxWidth: 500,
            margin: '0 auto 40px',
          }}
        >
          Join thousands of people who stopped managing habits and started leveling up their lives.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            maxWidth: 500,
            margin: '0 auto 16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <input
            type="email"
            placeholder="Your email address"
            style={{
              flex: 1,
              minWidth: 220,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <Link
            href="/login"
            style={{
              background: 'white',
              color: '#7C3AED',
              padding: '14px 28px',
              borderRadius: 12,
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Start Free ⚔️
          </Link>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 40 }}>
          No credit card. No spam. Just XP.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            flexWrap: 'wrap',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
          }}
        >
          <span>⚡ XP System</span>
          <span>•</span>
          <span>🌳 Skill Tree</span>
          <span>•</span>
          <span>🤖 AI Coach</span>
          <span>•</span>
          <span>👥 Party</span>
          <span>•</span>
          <span>💑 Couple Mode</span>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer style={{ background: '#08080F', padding: '60px 24px 32px', borderTop: '1px solid #1E1E35' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              ⚔️ Life RPG OS
            </div>
            <p style={{ color: '#9B99B8', fontSize: 14, marginBottom: 20 }}>
              Treat life like the game it is.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['𝕏', '📸', '💬'].map((icon) => (
                <span
                  key={icon}
                  style={{
                    width: 36,
                    height: 36,
                    background: '#13131F',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#F1F0FF',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Product
            </div>
            {['Dashboard', 'Quests', 'Skill Tree', 'AI Coach', 'Party', 'Leaderboard'].map(
              (item) => (
                <Link
                  key={item}
                  href="/login"
                  style={{
                    display: 'block',
                    color: '#9B99B8',
                    textDecoration: 'none',
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  {item}
                </Link>
              )
            )}
          </div>

          {/* Col 3: Company */}
          <div>
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#F1F0FF',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Company
            </div>
            {['About', 'Blog (coming soon)', 'Careers', 'Press'].map((item) => (
              <div
                key={item}
                style={{ color: '#9B99B8', fontSize: 14, marginBottom: 10, cursor: 'default' }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Col 4: Legal */}
          <div>
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#F1F0FF',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Legal
            </div>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Cookie Policy', href: '/privacy' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'block',
                  color: '#9B99B8',
                  textDecoration: 'none',
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1E1E35',
            paddingTop: 24,
            textAlign: 'center',
            color: '#5C5A7A',
            fontSize: 14,
          }}
        >
          © 2025 Life RPG OS. Built with ☕ and XP.
        </div>
      </footer>

      {/* ============================================================
          CSS Animations & responsive styles
      ============================================================ */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes badge-float {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-8px); }
          80% { opacity: 1; transform: translateY(-12px); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .character-card-float {
          animation: float-card 3s ease-in-out infinite;
        }

        .floating-badge-1 {
          animation: badge-float 4s ease-in-out infinite;
        }

        .stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 15%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 90%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 65% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(2px 2px at 50% 30%, rgba(124,58,237,0.4) 0%, transparent 100%),
            radial-gradient(2px 2px at 75% 75%, rgba(124,58,237,0.3) 0%, transparent 100%);
        }

        .marquee-wrapper {
          overflow: hidden;
          width: 100%;
        }
        .marquee-track {
          width: max-content;
        }
        .marquee-left {
          animation: marquee-left 40s linear infinite;
        }
        .marquee-right {
          animation: marquee-right 40s linear infinite;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(124,58,237,0.6) !important;
          box-shadow: 0 0 20px rgba(124,58,237,0.15);
        }

        .btn-hero-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 0 40px rgba(124,58,237,0.5) !important;
        }

        @media (max-width: 900px) {
          .hero-inner {
            flex-direction: column !important;
          }
          .hero-left {
            flex: none !important;
            width: 100%;
          }
          .hero-right {
            flex: none !important;
            width: 100%;
          }
          .step-arrow {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
