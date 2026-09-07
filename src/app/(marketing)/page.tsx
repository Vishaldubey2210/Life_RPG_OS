'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Swords,
  Sparkles,
  Check,
  ChevronDown,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Brain,
  Trophy,
  Target,
  Users,
  Flame,
  Activity,
  Award,
} from 'lucide-react'

// FAQ Items Data
const FAQS = [
  {
    q: 'Is Life RPG OS really free to start?',
    a: 'Yes. The Adventurer tier is free forever with zero credit card required. It includes core daily quests, full 6-attribute stat calculation, streak tracking, and progression up to Level 20.',
  },
  {
    q: 'How is this different from standard habit trackers?',
    a: 'Traditional trackers treat habits as binary checklists that quickly feel like chores. Life RPG OS is an active character progression engine: real habits award XP, scale attributes (Strength, Intellect, Wisdom, Vitality, Charisma), unlock skill tree perks, and deal raid damage to weekly boss battles.',
  },
  {
    q: 'How does the AI Tactical Coach work?',
    a: 'Your AI Coach analyzes your daily completion rate, consistency patterns, and energy levels. It delivers morning briefings, detects burnout risks before they happen, and generates weekly strategic reports tailored to your archetype.',
  },
  {
    q: 'Can I play with friends or my partner?',
    a: 'Yes. Form a guild party of up to 6 players to take on collective boss raids. Couple Mode pairs two adventurers with shared streak multipliers, co-op health pools, and joint milestone rewards.',
  },
  {
    q: 'What happens if I miss a daily habit?',
    a: 'Skipping a quest deals calculated damage to your daily HP bar. Maintain high vitality to resist penalties, or execute recovery habits and streak freezes to restore health before daily reset.',
  },
  {
    q: 'Does it work offline and across devices?',
    a: 'Yes. Engineered as an installable progressive web app with full offline caching and instant cloud sync across iOS, Android, macOS, and Windows.',
  },
]

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const featureTabs = [
    {
      title: 'Attribute Matrix',
      badge: 'Core Engine',
      description:
        'Every real-world habit routes XP into 6 core RPG attributes: Strength, Intellect, Wisdom, Vitality, Charisma, and Focus. Watch your spider-chart and character sheet evolve in real time.',
      stats: [
        { label: 'Discipline / STR', value: '88%', color: '#5B57F0', level: 'Lvl 24' },
        { label: 'Intellect / INT', value: '94%', color: '#F0955B', level: 'Lvl 31' },
        { label: 'Vitality / VIT', value: '76%', color: '#2FA36B', level: 'Lvl 19' },
      ],
    },
    {
      title: 'Skill Tree Mastery',
      badge: 'Progression',
      description:
        'Unlock active passives and lifestyle perks as you maintain streaks. Earn specialized talent points to invest in Deep Work Mastery, Athletic Endurance, and Emotional Resilience nodes.',
      stats: [
        { label: 'Deep Focus Node', value: '82%', color: '#5B57F0', level: 'Tier 3' },
        { label: 'Endurance Path', value: '68%', color: '#F0955B', level: 'Tier 2' },
        { label: 'Recovery Aura', value: '90%', color: '#2FA36B', level: 'Tier 4' },
      ],
    },
    {
      title: 'Guild Boss Raids',
      badge: 'Social Co-op',
      description:
        'Rally up to 6 party members or enter Couple Mode. Every completed habit strikes calculated damage against giant weekly bosses like Procrastination Demon and Burnout Titan.',
      stats: [
        { label: 'Party Raid DPS', value: '85%', color: '#5B57F0', level: '2,450 XP/d' },
        { label: 'Boss HP Depleted', value: '62%', color: '#F0955B', level: 'Phase 2' },
        { label: 'Guild Shielding', value: '96%', color: '#2FA36B', level: 'Active' },
      ],
    },
    {
      title: 'AI Tactical Briefings',
      badge: 'Intelligence',
      description:
        'A dedicated AI Dungeon Master that analyzes velocity patterns, detects friction debuffs, and provides calm, adaptive coaching suggestions each morning.',
      stats: [
        { label: 'Consistency Velocity', value: '91%', color: '#5B57F0', level: '+14% MoM' },
        { label: 'Debuff Recovery', value: '74%', color: '#F0955B', level: 'Optimal' },
        { label: 'Energy Alignment', value: '88%', color: '#2FA36B', level: 'Peak' },
      ],
    },
  ]

  return (
    <div
      style={{
        background: '#FBFAF7',
        color: '#232019',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ─────────────────────────────────────────────────────────
          1. HERO SECTION
          Matches hero-light-creative-v1.html specifications exactly
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '110px 24px 100px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        {/* Warm background blob (radial gradient blur, top-right) */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -60,
            width: 580,
            height: 580,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #EDECFD 0%, rgba(237, 236, 253, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 56,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Text & CTAs */}
          <div>
            {/* Eyebrow with ✦ mark */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#5B57F0',
                fontSize: 13.5,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                marginBottom: 20,
              }}
            >
              <span>✦</span>
              <span>Life RPG OS v2.4 · Real life character sheet</span>
            </div>

            {/* Headline with single Fraunces italic signature */}
            <h1
              style={{
                fontSize: 54,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                fontWeight: 700,
                color: '#232019',
                margin: '0 0 22px 0',
              }}
            >
              Stop tracking habits. Start leveling{' '}
              <span
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#5B57F0',
                }}
              >
                up.
              </span>
            </h1>

            {/* Body copy */}
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: '#6E6A61',
                margin: '0 0 36px 0',
                maxWidth: 480,
              }}
            >
              Transform your daily discipline, fitness, and career routines into an interactive RPG
              character progression engine. Real habits earn XP, unlock talent trees, and slay procrastination.
            </p>

            {/* Action Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 44,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/login"
                style={{
                  background: '#232019',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '14px 28px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(35, 32, 25, 0.12)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#38342C'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(35, 32, 25, 0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#232019'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(35, 32, 25, 0.12)'
                }}
              >
                <span>Get started free</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#how-it-works"
                style={{
                  color: '#232019',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  borderBottom: '1.5px solid #232019',
                  paddingBottom: 2,
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                How it works →
              </a>
            </div>

            {/* Social Proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Adventurer"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '2px solid #FBFAF7',
                      marginLeft: i > 0 ? -8 : 0,
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13.5, color: '#6E6A61', fontWeight: 500 }}>
                <span style={{ color: '#232019', fontWeight: 700 }}>10,000+</span> adventurers leveling up daily
              </div>
            </div>
          </div>

          {/* Right Column: Character Card with Signature Radial Level Ring + 3 Mini Bars */}
          <div
            style={{
              position: 'relative',
              perspective: 1000,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 22,
                border: '1px solid #EAE6DD',
                padding: '32px 28px',
                boxShadow: '0 24px 60px rgba(35, 32, 25, 0.09)',
                transform: 'rotate(2.5deg)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 32px 70px rgba(35, 32, 25, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotate(2.5deg)'
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(35, 32, 25, 0.09)'
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#232019' }}>
                    Aether Paladin
                  </div>
                  <div style={{ fontSize: 13, color: '#A19C90', marginTop: 2 }}>
                    Daily Quest Completion: <strong style={{ color: '#5B57F0' }}>100%</strong>
                  </div>
                </div>
                <div
                  style={{
                    background: '#EDECFD',
                    color: '#5B57F0',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  Season 4
                </div>
              </div>

              {/* Central Radial Level Ring */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 0 24px',
                }}
              >
                <div style={{ position: 'relative', width: 140, height: 140 }}>
                  <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Track */}
                    <circle
                      cx="70"
                      cy="70"
                      r="58"
                      stroke="#F0EEE6"
                      strokeWidth="9"
                      fill="none"
                    />
                    {/* Progress Stroke */}
                    <circle
                      cx="70"
                      cy="70"
                      r="58"
                      stroke="#5B57F0"
                      strokeWidth="9"
                      strokeDasharray="364.4"
                      strokeDashoffset="80"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  {/* Inside Text */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 26,
                        fontWeight: 600,
                        color: '#232019',
                        lineHeight: 1,
                      }}
                    >
                      Lvl 18
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: '#6E6A61',
                        fontWeight: 500,
                        marginTop: 4,
                      }}
                    >
                      7,850 / 10k XP
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Mini Stat Bars (Strictly using --accent, --accent-2, --success) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Stat 1: Discipline / STR */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: '#232019', fontWeight: 600 }}>Discipline (STR)</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#5B57F0',
                        fontWeight: 600,
                      }}
                    >
                      88%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 7,
                      borderRadius: 999,
                      background: '#F0EEE6',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '88%',
                        height: '100%',
                        borderRadius: 999,
                        background: '#5B57F0',
                      }}
                    />
                  </div>
                </div>

                {/* Stat 2: Intellect / INT */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: '#232019', fontWeight: 600 }}>Intellect (INT)</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#F0955B',
                        fontWeight: 600,
                      }}
                    >
                      94%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 7,
                      borderRadius: 999,
                      background: '#F0EEE6',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '94%',
                        height: '100%',
                        borderRadius: 999,
                        background: '#F0955B',
                      }}
                    />
                  </div>
                </div>

                {/* Stat 3: Vitality / VIT */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ color: '#232019', fontWeight: 600 }}>Vitality (VIT)</span>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#2FA36B',
                        fontWeight: 600,
                      }}
                    >
                      76%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 7,
                      borderRadius: 999,
                      background: '#F0EEE6',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '76%',
                        height: '100%',
                        borderRadius: 999,
                        background: '#2FA36B',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Perk Pill at bottom */}
              <div
                style={{
                  marginTop: 22,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#FBFAF7',
                  border: '1px solid #EAE6DD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12.5,
                  color: '#6E6A61',
                }}
              >
                <Flame size={15} color="#F0955B" />
                <span>
                  Active Perk: <strong style={{ color: '#232019' }}>42-Day Deep Work Streak</strong> (+15% XP)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          2. TESTIMONIALS SECTION
          "People stopped treating life like a checklist"
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '96px 24px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
          <div
            style={{
              color: '#5B57F0',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 12,
            }}
          >
            Player experiences
          </div>
          <h2
            style={{
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontWeight: 700,
              color: '#232019',
              margin: '0 0 16px 0',
            }}
          >
            People stopped treating life like a{' '}
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#5B57F0',
              }}
            >
              checklist.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#6E6A61', margin: 0, lineHeight: 1.6 }}>
            Read how software engineers, founders, and students converted mundane habit tracking into
            a self-sustaining RPG engine.
          </p>
        </div>

        {/* Testimonials Grid: Featured Large Card + 3 Compact Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className="testimonials-grid"
        >
          {/* Featured Card (Spans 2 columns) */}
          <div
            style={{
              gridColumn: 'span 2',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '36px 36px',
              boxShadow: '0 20px 50px rgba(35, 32, 25, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="featured-testimonial"
          >
            <div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#5B57F0" color="#5B57F0" />
                ))}
              </div>
              <blockquote
                style={{
                  fontSize: 20,
                  lineHeight: 1.5,
                  color: '#232019',
                  fontWeight: 500,
                  margin: '0 0 28px 0',
                }}
              >
                &ldquo;I’ve tried Notion templates, Todoist, and Streaks. Life RPG OS is the only thing that
                actually worked because missing a workout damages my party in our weekly boss raid. The stakes
                make consistency genuinely fun.&rdquo;
              </blockquote>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 20,
                borderTop: '1px solid #F0EEE6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Sarah Lin"
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#232019' }}>Sarah Lin</div>
                  <div style={{ fontSize: 13, color: '#6E6A61' }}>Staff Engineer @ Scale AI</div>
                </div>
              </div>
              <span
                style={{
                  background: '#EDECFD',
                  color: '#5B57F0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 999,
                }}
              >
                Lvl 24 Paladin
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '30px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#5B57F0" color="#5B57F0" />
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#232019', margin: '0 0 20px 0' }}>
                &ldquo;Couple Mode completely revolutionized how my partner and I split chores and study sessions.
                Leveling up together feels rewarding.&rdquo;
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid #F0EEE6',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#232019' }}>Marcus Vance</div>
                <div style={{ fontSize: 12.5, color: '#6E6A61' }}>Product Designer</div>
              </div>
              <span
                style={{
                  background: '#EDECFD',
                  color: '#5B57F0',
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                Lvl 19 Ranger
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '30px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#5B57F0" color="#5B57F0" />
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#232019', margin: '0 0 20px 0' }}>
                &ldquo;The AI tactical briefings catch my burnout patterns 3 days before I crash.
                It suggested a recovery quest that saved my entire month.&rdquo;
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid #F0EEE6',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#232019' }}>Elena Rostova</div>
                <div style={{ fontSize: 12.5, color: '#6E6A61' }}>Medical Resident</div>
              </div>
              <span
                style={{
                  background: '#EDECFD',
                  color: '#5B57F0',
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                Lvl 31 Archmage
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div
            style={{
              gridColumn: 'span 2',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '30px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="featured-testimonial"
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#5B57F0" color="#5B57F0" />
                ))}
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#232019', margin: '0 0 20px 0' }}>
                &ldquo;Seeing my physical health turn into a tangible Vitality stat and my reading into Intellect XP
                made me realize where my life was out of balance. It is clean, calm, and addictive.&rdquo;
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid #F0EEE6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Devon Park"
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#232019' }}>Devon Park</div>
                  <div style={{ fontSize: 12.5, color: '#6E6A61' }}>Founder @ Hyperfocus</div>
                </div>
              </div>
              <span
                style={{
                  background: '#EDECFD',
                  color: '#5B57F0',
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                Lvl 42 Grandmaster
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          3. FEATURES / MODULES SECTION
          "The UI is the character sheet"
      ───────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: '96px 24px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
          <div
            style={{
              color: '#5B57F0',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 12,
            }}
          >
            Character Architecture
          </div>
          <h2
            style={{
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontWeight: 700,
              color: '#232019',
              margin: '0 0 16px 0',
            }}
          >
            The UI is your character{' '}
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#5B57F0',
              }}
            >
              sheet.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#6E6A61', margin: 0, lineHeight: 1.6 }}>
            Select any engine module to view how your real-world activities map to your living avatar.
          </p>
        </div>

        {/* Clean Vertical Tab List + Right Panel View */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: 40,
            alignItems: 'center',
          }}
          className="features-grid"
        >
          {/* Left: Clean Vertical Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {featureTabs.map((tab, idx) => {
              const isActive = activeTab === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    textAlign: 'left',
                    background: isActive ? '#EDECFD' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '4px solid #5B57F0' : '4px solid transparent',
                    borderRadius: '0 16px 16px 0',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#232019' : '#6E6A61',
                      }}
                    >
                      {tab.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: isActive ? '#5B57F0' : '#A19C90',
                        background: isActive ? '#FFFFFF' : '#F0EEE6',
                        padding: '3px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  {isActive && (
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: '#6E6A61',
                        margin: '10px 0 0 0',
                      }}
                    >
                      {tab.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Dynamic Interactive Preview Panel */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 22,
              border: '1px solid #EAE6DD',
              padding: '36px 32px',
              boxShadow: '0 24px 60px rgba(35, 32, 25, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#232019' }}>
                  {featureTabs[activeTab].title}
                </div>
                <div style={{ fontSize: 13, color: '#A19C90', marginTop: 3 }}>
                  Active Module Telemetry · Live Sync
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#EDECFD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="#5B57F0" />
              </div>
            </div>

            {/* Central Stat Bars in Module */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
              {featureTabs[activeTab].stats.map((st, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13.5,
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ color: '#232019', fontWeight: 600 }}>{st.label}</span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#6E6A61', fontWeight: 500 }}>{st.level}</span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          color: st.color,
                          fontWeight: 600,
                        }}
                      >
                        {st.value}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: '#F0EEE6',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: st.value,
                        height: '100%',
                        borderRadius: 999,
                        background: st.color,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action in Panel */}
            <div
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: '#FBFAF7',
                border: '1px solid #EAE6DD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={16} color="#2FA36B" />
                <span style={{ fontSize: 13, color: '#232019', fontWeight: 500 }}>
                  Automated streak recalculation every midnight
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: '#5B57F0',
                  fontWeight: 600,
                }}
              >
                +250 XP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          4. PROCESS / PHASES
          "Continuous progression in 3 steps"
      ───────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '96px 24px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
          <div
            style={{
              color: '#5B57F0',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 12,
            }}
          >
            How it works
          </div>
          <h2
            style={{
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontWeight: 700,
              color: '#232019',
              margin: '0 0 16px 0',
            }}
          >
            Continuous progression in three{' '}
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#5B57F0',
              }}
            >
              steps.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#6E6A61', margin: 0, lineHeight: 1.6 }}>
            A frictionless loop designed to turn daily habits into an effortless dopamine feedback cycle.
          </p>
        </div>

        {/* 3 Numbered Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
          }}
          className="steps-grid"
        >
          {/* Step 01 */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '36px 30px',
              boxShadow: '0 12px 30px rgba(35, 32, 25, 0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#5B57F0',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              01
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#232019', margin: '0 0 12px 0' }}>
              Choose your archetype
            </h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#6E6A61', margin: 0 }}>
              Select a class that matches your real goals (Paladin for fitness & discipline, Scholar for deep work,
              or Alchemist for habit experimentation).
            </p>
          </div>

          {/* Step 02 */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '36px 30px',
              boxShadow: '0 12px 30px rgba(35, 32, 25, 0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#5B57F0',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              02
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#232019', margin: '0 0 12px 0' }}>
              Complete daily quests
            </h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#6E6A61', margin: 0 }}>
              Log workouts, coding blocks, or meditation sessions. Each check-in awards attribute XP,
              maintains your streak multiplier, and charges your raid power.
            </p>
          </div>

          {/* Step 03 */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #EAE6DD',
              padding: '36px 30px',
              boxShadow: '0 12px 30px rgba(35, 32, 25, 0.05)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#5B57F0',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              03
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#232019', margin: '0 0 12px 0' }}>
              Level up your real life
            </h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#6E6A61', margin: 0 }}>
              Unlock skill tree perks, defeat weekly raid bosses with your guild, and receive tactical
              weekly summaries from your personal AI Dungeon Master.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          5. STATS ROW
          10,000+ / 85% / 3.4x / 500K+
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          maxWidth: 1140,
          margin: '0 auto',
          borderTop: '1px solid #EAE6DD',
          borderBottom: '1px solid #EAE6DD',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 32,
            textAlign: 'center',
          }}
          className="stats-grid"
        >
          <div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#232019',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              10,000+
            </div>
            <div style={{ fontSize: 14, color: '#6E6A61', fontWeight: 500 }}>
              Active Adventurers
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#232019',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              85%
            </div>
            <div style={{ fontSize: 14, color: '#6E6A61', fontWeight: 500 }}>
              30-Day Retention Rate
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#232019',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              3.4x
            </div>
            <div style={{ fontSize: 14, color: '#6E6A61', fontWeight: 500 }}>
              Habit Consistency Multiplier
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: '#232019',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              500K+
            </div>
            <div style={{ fontSize: 14, color: '#6E6A61', fontWeight: 500 }}>
              Quests Completed
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          6. PRICING SECTION
          3 Cards with Hero Tier promoted structurally in --accent-soft
      ───────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: '110px 24px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
          <div
            style={{
              color: '#5B57F0',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 12,
            }}
          >
            Transparent pricing
          </div>
          <h2
            style={{
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontWeight: 700,
              color: '#232019',
              margin: '0 0 16px 0',
            }}
          >
            Invest in your personal{' '}
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#5B57F0',
              }}
            >
              journey.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#6E6A61', margin: 0, lineHeight: 1.6 }}>
            Start for free forever. Upgrade anytime when you are ready to unlock AI coaching and guild raids.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
            alignItems: 'center',
          }}
          className="pricing-grid"
        >
          {/* Tier 1: Adventurer (Free) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 22,
              border: '1px solid #EAE6DD',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#232019' }}>Adventurer</div>
              <div style={{ fontSize: 13.5, color: '#6E6A61', marginTop: 4 }}>
                For individuals starting their self-improvement journey.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 28 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 40,
                  fontWeight: 600,
                  color: '#232019',
                }}
              >
                $0
              </span>
              <span style={{ fontSize: 14, color: '#6E6A61' }}>/ month</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, marginBottom: 32 }}>
              {[
                'Unlimited daily habits & quests',
                'Core 6-attribute stat matrix',
                'Basic streak freeze mechanic',
                'Level progression up to Lvl 20',
                'Web & Mobile PWA access',
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#232019' }}>
                  <Check size={16} color="#2FA36B" strokeWidth={2.5} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              style={{
                background: '#FFFFFF',
                color: '#232019',
                border: '1.5px solid #EAE6DD',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 14.5,
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: 999,
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
              Start free
            </Link>
          </div>

          {/* Tier 2: Champion (Hero Tier - Highlighted in --accent-soft) */}
          <div
            style={{
              background: '#EDECFD',
              borderRadius: 24,
              border: '2px solid #5B57F0',
              padding: '44px 34px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(91, 87, 240, 0.12)',
              position: 'relative',
              transform: 'scale(1.02)',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#232019' }}>Champion</div>
                <span
                  style={{
                    background: '#5B57F0',
                    color: '#FFFFFF',
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  Recommended
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: '#6E6A61', marginTop: 6 }}>
                Full RPG depth with AI Dungeon Master & skill tree passives.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 28 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 44,
                  fontWeight: 600,
                  color: '#232019',
                }}
              >
                $9
              </span>
              <span style={{ fontSize: 14, color: '#6E6A61' }}>/ month, billed annually</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, marginBottom: 36 }}>
              {[
                'Everything in Adventurer',
                'Uncapped level & prestige tiers',
                'Full skill tree with custom passives',
                'AI Tactical Dungeon Master coaching',
                'Weekly World Boss raids & loot drops',
                'Couple Mode co-op progression',
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#232019' }}>
                  <Check size={16} color="#5B57F0" strokeWidth={2.5} />
                  <span style={{ fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              style={{
                background: '#5B57F0',
                color: '#FFFFFF',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                padding: '14px 24px',
                borderRadius: 999,
                boxShadow: '0 4px 16px rgba(91, 87, 240, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4A46E0'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#5B57F0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Start 7-day trial
            </Link>
          </div>

          {/* Tier 3: Guild Master */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 22,
              border: '1px solid #EAE6DD',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#232019' }}>Guild Master</div>
              <div style={{ fontSize: 13.5, color: '#6E6A61', marginTop: 4 }}>
                For teams, couples, and high-performance accountability pods.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 28 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 40,
                  fontWeight: 600,
                  color: '#232019',
                }}
              >
                $24
              </span>
              <span style={{ fontSize: 14, color: '#6E6A61' }}>/ month (up to 6 seats)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, marginBottom: 32 }}>
              {[
                'Everything in Champion tier',
                'Up to 6 party members included',
                'Custom guild raids & private leaderboards',
                'Group damage telemetry & analytics',
                'Priority server sync & roadmap voting',
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#232019' }}>
                  <Check size={16} color="#2FA36B" strokeWidth={2.5} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              style={{
                background: '#FFFFFF',
                color: '#232019',
                border: '1.5px solid #EAE6DD',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 14.5,
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: 999,
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
              Start team trial
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          7. FAQ SECTION
          Plain questions with chevrons and hairline dividers
      ───────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          padding: '96px 24px',
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', margin: '0 auto 50px' }}>
          <div
            style={{
              color: '#5B57F0',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 12,
            }}
          >
            Got questions?
          </div>
          <h2
            style={{
              fontSize: 38,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              fontWeight: 700,
              color: '#232019',
              margin: '0 0 14px 0',
            }}
          >
            Frequently asked{' '}
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#5B57F0',
              }}
            >
              questions.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: '#6E6A61', margin: 0 }}>
            Everything you need to know about the product, billing, and mechanics.
          </p>
        </div>

        {/* Accordion list with hairline dividers */}
        <div style={{ borderTop: '1px solid #EAE6DD' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid #EAE6DD',
                  padding: '22px 0',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: isOpen ? '#5B57F0' : '#232019',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#6E6A61',
                    }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: '#6E6A61',
                          margin: '14px 0 0 0',
                        }}
                      >
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          8. FINAL CTA
          Centered on --accent-soft panel with Fraunces italic signature
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px 110px',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#EDECFD',
            borderRadius: 28,
            padding: '72px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(91, 87, 240, 0.08)',
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                color: '#5B57F0',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <span>✦</span> Start your campaign today
            </div>

            <h2
              style={{
                fontSize: 42,
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#232019',
                margin: '0 0 18px 0',
              }}
            >
              Ready to turn your everyday routines into an{' '}
              <span
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#5B57F0',
                }}
              >
                adventure?
              </span>
            </h2>

            <p
              style={{
                fontSize: 16.5,
                lineHeight: 1.6,
                color: '#6E6A61',
                margin: '0 0 36px 0',
              }}
            >
              Join over 10,000 adventurers building real discipline, physical endurance, and deep work habits.
              Free forever, no credit card required.
            </p>

            <Link
              href="/login"
              style={{
                background: '#232019',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 15.5,
                fontWeight: 600,
                padding: '16px 36px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(35, 32, 25, 0.15)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#38342C'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#232019'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span>Create your character</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          9. FOOTER
          Clean light footer in --bg / --panel with subtle meta links
      ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #EAE6DD',
          background: '#FBFAF7',
          padding: '60px 24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #5B57F0, #8A86FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Swords size={14} color="#ffffff" strokeWidth={2} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#232019' }}>
                Life RPG OS
              </span>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#features" style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14 }}>
                Features
              </a>
              <a href="#how-it-works" style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14 }}>
                How it works
              </a>
              <a href="#pricing" style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14 }}>
                Pricing
              </a>
              <a href="#faq" style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14 }}>
                FAQ
              </a>
              <Link href="/login" style={{ color: '#6E6A61', textDecoration: 'none', fontSize: 14 }}>
                Sign In
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #EAE6DD',
              paddingTop: 24,
              fontSize: 13,
              color: '#A19C90',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>© {new Date().getFullYear()} Life RPG OS. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" style={{ color: '#A19C90', textDecoration: 'none' }}>
                Privacy Policy
              </a>
              <a href="#" style={{ color: '#A19C90', textDecoration: 'none' }}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive media styling */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .testimonials-grid, .steps-grid, .pricing-grid, .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .featured-testimonial {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
