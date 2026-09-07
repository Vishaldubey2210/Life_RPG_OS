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
  Lock,
  Compass,
  Milestone,
  CheckCircle2,
  Heart,
  Crown,
  BookOpen,
  Dumbbell,
  Code2,
} from 'lucide-react'

// Indian Localized FAQ Items
const FAQS = [
  {
    q: 'Kya Life RPG OS sach me free hai?',
    a: 'Haan! The Adventurer tier is 100% Free Forever with zero credit card required. Isme unlimited daily quests, 6-attribute stat progression, streak mechanics, aur Level 20 tak ka progression included hai.',
  },
  {
    q: 'Ye standard habit trackers (Notion/Todoist) se kaise alag hai?',
    a: 'Boring checklists roz reset ho jaati hain aur burden lagne lagti hain. Life RPG OS me aapki har real-life habit (DSA question, Gym workout, UPSC answer writing, Book reading) aapke character ko XP deti hai, stats (Strength, Intellect, Vitality) badhati hai, aur weekly World Boss battles me raid damage karti hai.',
  },
  {
    q: 'Can students (JEE / NEET / UPSC / GATE) and Coders use this?',
    a: 'Bilkul! 50,000+ Indian students aur software engineers isko study routines, 100 Days of LeetCode, daily revision schedules, aur physical fitness ke liye use kar rahe hain. Har subject ya task ek specific attribute (Intellect / Wisdom / Focus) ko level up karta hai.',
  },
  {
    q: 'How does Couple Mode & Guild Party work?',
    a: 'Aap apne dosto ya partner ke saath 6-player squad bana sakte ho. Saath me weekly boss (Procrastination Demon) ko defeat karo, shared streak multipliers enjoy karo, aur ek dusre ko accountability do.',
  },
  {
    q: 'What payment methods are supported in India?',
    a: 'All plans support instant UPI (Google Pay, PhonePe, Paytm), Indian Debit/Credit Cards, and Netbanking with automatic rupee invoicing.',
  },
  {
    q: 'Does it work offline on mobile (Android / iOS)?',
    a: 'Haan, Life RPG OS installable PWA hai jo lightweight hai, instant load hoti hai, aur offline sync ke saath smooth chalti hai.',
  },
]

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const featureTabs = [
    {
      title: '6-Attribute Character Sheet',
      badge: 'Core Engine',
      description:
        'Aapki har daily activity 6 core RPG stats me convert hoti hai: Strength (Gym/Fitness), Intellect (Coding/Studies), Wisdom (Reading/Meditation), Vitality (Sleep/Hydration), Charisma (Public Speaking/Networking), aur Focus (Deep Work).',
      stats: [
        { label: 'Strength (Gym & 5AM Workout)', value: '88%', color: '#7C3AED', level: 'Lvl 24' },
        { label: 'Intellect (DSA / Exam Prep)', value: '94%', color: '#F59E0B', level: 'Lvl 31' },
        { label: 'Vitality (Sleep & Recovery)', value: '76%', color: '#10B981', level: 'Lvl 19' },
        { label: 'Wisdom (Reading & Gita)', value: '82%', color: '#06B6D4', level: 'Lvl 22' },
      ],
    },
    {
      title: 'Skill Tree & Talent Perks',
      badge: 'Progression',
      description:
        'Jaise jaise aap streak maintain karte ho, aapko talent points milte hain. Unlock passives like "120-Min Deep Work Flow State", "Zero Sugar Discipline", aur "Athletic Recovery Aura".',
      stats: [
        { label: 'Deep Focus Node (Tier 3)', value: '85%', color: '#7C3AED', level: 'Active' },
        { label: '100-Days-Of-Code Master', value: '72%', color: '#F59E0B', level: 'Lvl 18' },
        { label: 'Cold Shower Resilience', value: '90%', color: '#10B981', level: 'Tier 4' },
        { label: 'Early Riser (5:30 AM Aura)', value: '95%', color: '#06B6D4', level: 'Tier 5' },
      ],
    },
    {
      title: 'Guild Raids & Boss Battles',
      badge: 'Co-op India',
      description:
        'Apne college friends, flatmates, ya team ke saath Party banao. Har completed habit giant weekly boss (Procrastination Demon, Burnout Titan) par live DPS damage karti hai.',
      stats: [
        { label: 'Bengaluru Squad DPS', value: '89%', color: '#7C3AED', level: '3,800 XP/day' },
        { label: 'Procrastination Demon HP', value: '38%', color: '#EF4444', level: 'Phase 3' },
        { label: 'Party Shield Multiplier', value: '98%', color: '#10B981', level: 'Active 1.5x' },
        { label: 'Weekly Loot Drop', value: '100%', color: '#F59E0B', level: 'Chest Ready' },
      ],
    },
    {
      title: 'AI Tactical Chanakya / Coach',
      badge: 'AI Briefings',
      description:
        'Aapka personal AI strategist jo aapke study aur habit patterns ko analyze karke subah daily morning briefing deta hai, burnout se bachata hai, aur personalized daily schedule optimize karta hai.',
      stats: [
        { label: 'Consistency Velocity', value: '92%', color: '#7C3AED', level: '+18% MoM' },
        { label: 'Burnout Recovery', value: '80%', color: '#10B981', level: 'Optimal' },
        { label: 'Daily Briefing Alignment', value: '96%', color: '#F59E0B', level: 'Peak' },
        { label: 'Target Exam Velocity', value: '86%', color: '#06B6D4', level: 'On Track' },
      ],
    },
  ]

  return (
    <div
      style={{
        background: '#070710',
        color: '#F3F4F6',
        fontFamily: "'Inter', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ─────────────────────────────────────────────────────────
          1. HERO SECTION (Dark Glowing RPG HUD)
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          padding: '90px 24px 80px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Glowing radial ambient lights */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: '30%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0) 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 100,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column: Text & CTAs */}
          <div>
            {/* Eyebrow Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(124, 58, 237, 0.15)',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                color: '#C4B5FD',
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 999,
                marginBottom: 20,
              }}
            >
              <Zap size={14} className="text-amber-400" />
              <span>India’s #1 Real-Life Gamification OS · v2.4</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 54,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 20px 0',
              }}
            >
              Stop tracking habits.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #A78BFA, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Level up your real life.
              </span>
            </h1>

            {/* Body copy */}
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: '#9CA3AF',
                margin: '0 0 32px 0',
                maxWidth: 520,
              }}
            >
              Turn your daily studies, coding grind, 5AM gym, and reading into an epic RPG adventure.
              Earn XP, upgrade 6 attributes, conquer weekly guild bosses, and build unstoppable discipline.
            </p>

            {/* Action Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 40,
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/login"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '14px 28px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 24px rgba(124, 58, 237, 0.5)',
                  border: '1px solid rgba(167, 139, 250, 0.4)',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(124, 58, 237, 0.7)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(124, 58, 237, 0.5)'
                }}
              >
                <Swords size={16} />
                <span>Start Your Campaign Free</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#how-it-works"
                style={{
                  background: '#131427',
                  border: '1px solid #23233E',
                  color: '#D1D5DB',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '14px 24px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7C3AED'
                  e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#23233E'
                  e.currentTarget.style.color = '#D1D5DB'
                }}
              >
                How It Works
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
                    alt="Indian Adventurer"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: '2px solid #070710',
                      marginLeft: i > 0 ? -10 : 0,
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13.5, color: '#9CA3AF' }}>
                <strong style={{ color: '#F59E0B' }}>50,000+</strong> Indian aspirants & coders leveling up daily
              </div>
            </div>
          </div>

          {/* Right Column: Character Card (Dark Glowing HUD) */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                background: 'linear-gradient(145deg, #101124, #0B0C18)',
                borderRadius: 20,
                border: '1px solid rgba(124, 58, 237, 0.4)',
                padding: '28px 24px',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.25), 0 20px 40px rgba(0,0,0,0.6)',
                position: 'relative',
              }}
            >
              {/* Card Header with Level & Class */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(35, 35, 62, 0.8)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
                    }}
                  >
                    <Crown size={22} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                      Aarav Sharma
                    </div>
                    <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>
                      Class: <strong style={{ color: '#A78BFA' }}>SDE Paladin · Bengaluru</strong>
                    </div>
                  </div>
                </div>
                {/* Level Badge */}
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#F59E0B',
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  Level 24
                </div>
              </div>

              {/* XP Bar & HP Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {/* XP Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#C4B5FD', fontWeight: 600 }}>XP Progress</span>
                    <span style={{ color: '#A78BFA', fontFamily: "'JetBrains Mono', monospace" }}>8,450 / 10,000 XP (84%)</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#1B1C33', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '84%',
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                        boxShadow: '0 0 12px rgba(124, 58, 237, 0.8)',
                      }}
                    />
                  </div>
                </div>

                {/* HP Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#FCA5A5', fontWeight: 600 }}>Health / Vitality</span>
                    <span style={{ color: '#F87171', fontFamily: "'JetBrains Mono', monospace" }}>95 / 100 HP</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#1B1C33', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '95%',
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #EF4444, #F87171)',
                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Quests Checklist */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Today’s Campaign Quests
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { title: 'Solve 2 LeetCode Mediums (Trees & Graphs)', xp: '+250 XP', stat: 'INT +3', done: true, icon: Code2 },
                    { title: '5:30 AM Gym Workout (Chest & Triceps)', xp: '+300 XP', stat: 'STR +4', done: true, icon: Dumbbell },
                    { title: 'Read 15 Pages of Bhagavad Gita / Deep Work', xp: '+150 XP', stat: 'WIS +2', done: true, icon: BookOpen },
                    { title: 'System Design Mock / UPSC GS Revision', xp: '+400 XP', stat: 'FOC +5', done: false, icon: Brain },
                  ].map((q, idx) => {
                    const Icon = q.icon
                    return (
                      <div
                        key={idx}
                        style={{
                          background: q.done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(20, 21, 39, 0.8)',
                          border: `1px solid ${q.done ? 'rgba(16, 185, 129, 0.3)' : 'rgba(35, 35, 62, 0.8)'}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: q.done ? '#10B981' : 'transparent',
                              border: `1.5px solid ${q.done ? '#10B981' : '#4B5563'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                            }}
                          >
                            {q.done && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: 13, color: q.done ? '#E5E7EB' : '#9CA3AF', textDecoration: q.done ? 'line-through' : 'none' }}>
                            {q.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 10.5, color: '#A78BFA', fontWeight: 600 }}>{q.stat}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                            {q.xp}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Streak Footer Badge */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 600 }}>
                  <Flame size={15} />
                  <span>48-Day Active Streak</span>
                </div>
                <span style={{ color: '#D1D5DB' }}>+20% Party Bonus Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          2. STATS ROW (India Scale)
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: '1px solid #23233E',
          borderBottom: '1px solid #23233E',
          background: '#0D0E1C',
          padding: '60px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            textAlign: 'center',
          }}
          className="stats-grid"
        >
          <div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#A78BFA', marginBottom: 6 }}>
              50,000+
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>Active Indian Heroes</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#F59E0B', marginBottom: 6 }}>
              1.2M+
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>Quests Completed</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#10B981', marginBottom: 6 }}>
              89%
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>30-Day Streak Retention</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#06B6D4', marginBottom: 6 }}>
              ₹0
            </div>
            <div style={{ fontSize: 14, color: '#9CA3AF' }}>Forever Free to Start</div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          3. FEATURES / 6-ATTRIBUTES & SKILL TREES
      ───────────────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: '90px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 60px' }}>
          <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Engine Capabilities
          </div>
          <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 38, fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
            Transform Real Life Into A Character Sheet
          </h2>
          <p style={{ fontSize: 16, color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
            Har daily activity aapke real attributes ko boost karti hai. Chahe aap coding kar rahe ho, padhai kar rahe ho, ya gym ja rahe ho.
          </p>
        </div>

        {/* Feature Interactive Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
            gap: 36,
            alignItems: 'center',
          }}
          className="features-grid"
        >
          {/* Left: Tab Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {featureTabs.map((tab, idx) => {
              const isActive = activeTab === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    textAlign: 'left',
                    background: isActive ? 'rgba(124, 58, 237, 0.15)' : '#0D0E1C',
                    border: `1px solid ${isActive ? '#7C3AED' : '#23233E'}`,
                    borderLeft: isActive ? '4px solid #F59E0B' : `1px solid #23233E`,
                    borderRadius: 12,
                    padding: '20px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 18, fontWeight: 700, color: isActive ? '#FFFFFF' : '#D1D5DB' }}>
                      {tab.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isActive ? '#F59E0B' : '#9CA3AF',
                        background: isActive ? 'rgba(245, 158, 11, 0.15)' : '#1B1C33',
                        padding: '3px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  {isActive && (
                    <p style={{ fontSize: 14, color: '#9CA3AF', margin: '10px 0 0 0', lineHeight: 1.55 }}>
                      {tab.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: Live Interactive Stats Panel */}
          <div
            style={{
              background: '#101124',
              borderRadius: 20,
              border: '1px solid rgba(124, 58, 237, 0.3)',
              padding: '32px 28px',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  {featureTabs[activeTab].title}
                </div>
                <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>
                  Live Telemetry · Real-Time Calculation
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(124, 58, 237, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Activity size={18} color="#A78BFA" />
              </div>
            </div>

            {/* Stat Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {featureTabs[activeTab].stats.map((st, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#E5E7EB', fontWeight: 600 }}>{st.label}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{st.level}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: st.color, fontWeight: 700 }}>
                        {st.value}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#1A1B33', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: st.value,
                        height: '100%',
                        borderRadius: 999,
                        background: st.color,
                        boxShadow: `0 0 10px ${st.color}88`,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Perk Banner */}
            <div
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} className="text-amber-400" />
                <span style={{ fontSize: 13, color: '#E5E7EB', fontWeight: 600 }}>
                  Automated streak recalculation every midnight (IST)
                </span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>
                +350 XP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          4. HOW IT WORKS (3 Simple Steps)
      ───────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          background: '#0D0E1C',
          borderTop: '1px solid #23233E',
          borderBottom: '1px solid #23233E',
          padding: '90px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 60px' }}>
            <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              How It Works
            </div>
            <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 38, fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
              Your Adventure In 3 Easy Steps
            </h2>
            <p style={{ fontSize: 16, color: '#9CA3AF', margin: 0 }}>
              Zero complicated setup. 60 seconds me apna hero create karo aur grind start karo.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 28,
            }}
            className="steps-grid"
          >
            {/* Step 1 */}
            <div
              style={{
                background: '#131427',
                borderRadius: 18,
                border: '1px solid #23233E',
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  color: '#FFFFFF',
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
                }}
              >
                01
              </div>
              <h3 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Choose Your Class & Goals
              </h3>
              <p style={{ fontSize: 14.5, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
                Select whether you are a Coder Paladin, UPSC/JEE Scholar, Fitness Warrior, or Freelance Alchemist.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: '#131427',
                borderRadius: 18,
                border: '1px solid #23233E',
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#FFFFFF',
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                }}
              >
                02
              </div>
              <h3 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Complete Daily Quests
              </h3>
              <p style={{ fontSize: 14.5, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
                Log coding blocks, gym reps, or study chapters. Har check-in se instant XP, gold coins, aur streak multiplier milta hai.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: '#131427',
                borderRadius: 18,
                border: '1px solid #23233E',
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  fontFamily: "'Oxanium', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                }}
              >
                03
              </div>
              <h3 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Level Up In Real Life
              </h3>
              <p style={{ fontSize: 14.5, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
                Unlock high-tier perks, slay weekly guild bosses with your friends, aur AI Chanakya se weekly strategic growth reports pao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          5. INDIAN TESTIMONIALS
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '90px 24px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 60px' }}>
          <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Player Stories
          </div>
          <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 38, fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
            Loved by 50,000+ Indian Achievers
          </h2>
          <p style={{ fontSize: 16, color: '#9CA3AF', margin: 0 }}>
            Real reviews from engineers, aspirants, couples, and startup founders across India.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className="testimonials-grid"
        >
          {/* Review 1 */}
          <div
            style={{
              background: '#101124',
              borderRadius: 18,
              border: '1px solid #23233E',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#E5E7EB', margin: '0 0 20px 0' }}>
                &ldquo;Main pichle 2 saal se LeetCode aur gym me consistent nahi ho pa raha tha. Life RPG OS ne isko game bana diya. Aaj 60-day streak par hu aur Level 28 Paladin!&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1F2038', paddingTop: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#FFFFFF' }}>Aarav Sharma</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>SDE-2 @ Bengaluru</div>
              </div>
              <span style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#C4B5FD', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                Lvl 28 Paladin
              </span>
            </div>
          </div>

          {/* Review 2 */}
          <div
            style={{
              background: '#101124',
              borderRadius: 18,
              border: '1px solid #23233E',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#E5E7EB', margin: '0 0 20px 0' }}>
                &ldquo;UPSC preparation me daily answer writing aur newspaper analysis track karne ke liye best OS hai. 6-attribute balance dekhkar pata chalta hai mental health kaisi chal rahi hai.&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1F2038', paddingTop: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#FFFFFF' }}>Priya Sundaram</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>UPSC Aspirant @ New Delhi</div>
              </div>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                Lvl 34 Scholar
              </span>
            </div>
          </div>

          {/* Review 3 */}
          <div
            style={{
              background: '#101124',
              borderRadius: 18,
              border: '1px solid #23233E',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#E5E7EB', margin: '0 0 20px 0' }}>
                &ldquo;Couple Mode is insanely good! Me and my wife track our daily workouts, cooking, and reading goals together. It actually makes couple accountability fun.&rdquo;
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1F2038', paddingTop: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#FFFFFF' }}>Rohan & Ananya</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Tech Couple @ Mumbai</div>
              </div>
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                Co-op Duo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          6. PRICING SECTION (Indian Rupee ₹ INR)
      ───────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          background: '#0D0E1C',
          borderTop: '1px solid #23233E',
          borderBottom: '1px solid #23233E',
          padding: '90px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 60px' }}>
            <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
              Simple Transparent Pricing
            </div>
            <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 38, fontWeight: 800, color: '#FFFFFF', margin: '0 0 16px 0' }}>
              Invest In Your Self-Improvement
            </h2>
            <p style={{ fontSize: 16, color: '#9CA3AF', margin: 0 }}>
              Start 100% Free Forever. Upgrade with instant UPI / Netbanking whenever you want AI coaching.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 28,
              alignItems: 'center',
            }}
            className="pricing-grid"
          >
            {/* Tier 1: Free Adventurer */}
            <div
              style={{
                background: '#131427',
                borderRadius: 20,
                border: '1px solid #23233E',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  Adventurer
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                  For individual students & beginners starting their routine.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#FFFFFF' }}>
                  ₹0
                </span>
                <span style={{ fontSize: 14, color: '#9CA3AF' }}>/ forever free</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 28 }}>
                {[
                  'Unlimited daily quests & habits',
                  'Full 6-attribute character sheet',
                  'Streak tracker & freeze shields',
                  'Level up progression up to Lvl 20',
                  'Mobile & Desktop PWA access',
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#D1D5DB' }}>
                    <Check size={16} color="#10B981" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                style={{
                  background: '#1B1C33',
                  color: '#FFFFFF',
                  border: '1px solid #2E3056',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 20px',
                  borderRadius: 999,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2E3056')}
              >
                Start Free Forever
              </Link>
            </div>

            {/* Tier 2: Champion (Hero Plan) */}
            <div
              style={{
                background: 'linear-gradient(145deg, #181534, #121029)',
                borderRadius: 22,
                border: '2px solid #7C3AED',
                padding: '40px 32px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.3)',
                position: 'relative',
                transform: 'scale(1.03)',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
                    Champion Hero
                  </div>
                  <span
                    style={{
                      background: '#F59E0B',
                      color: '#070710',
                      fontFamily: "'Oxanium', sans-serif",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    MOST POPULAR
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#C4B5FD', marginTop: 4 }}>
                  Full RPG depth + AI Chanakya Dungeon Master.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 48, fontWeight: 800, color: '#F59E0B' }}>
                  ₹299
                </span>
                <span style={{ fontSize: 14, color: '#9CA3AF' }}>/ month (Billed yearly)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 32 }}>
                {[
                  'Everything in Adventurer tier',
                  'Uncapped Level 100+ & Prestige tiers',
                  'Full Skill Tree with custom talent perks',
                  'AI Tactical Chanakya daily briefings',
                  'Weekly Boss battles & legendary loot',
                  'Couple Mode co-op sync',
                  'Instant UPI / Card billing',
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#FFFFFF' }}>
                    <Check size={16} color="#F59E0B" strokeWidth={2.5} />
                    <span style={{ fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '14px 24px',
                  borderRadius: 999,
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.5)')}
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Tier 3: Guild Master */}
            <div
              style={{
                background: '#131427',
                borderRadius: 20,
                border: '1px solid #23233E',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  Guild Squad
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                  For study groups, flatmates, and engineering squads.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 44, fontWeight: 800, color: '#FFFFFF' }}>
                  ₹799
                </span>
                <span style={{ fontSize: 14, color: '#9CA3AF' }}>/ month (Up to 6 heroes)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 28 }}>
                {[
                  'Everything in Champion Hero',
                  'Up to 6 party members included',
                  'Shared weekly World Boss raids',
                  'Squad damage leaderboard & DPS charts',
                  'Priority discord role & roadmap voting',
                ].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#D1D5DB' }}>
                    <Check size={16} color="#10B981" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                style={{
                  background: '#1B1C33',
                  color: '#FFFFFF',
                  border: '1px solid #2E3056',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 20px',
                  borderRadius: 999,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7C3AED')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2E3056')}
              >
                Create Guild Party
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          7. FAQ SECTION
      ───────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          padding: '90px 24px',
          maxWidth: 850,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', margin: '0 auto 50px' }}>
          <div style={{ color: '#F59E0B', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>
            Frequently Asked
          </div>
          <h2 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 36, fontWeight: 800, color: '#FFFFFF', margin: '0 0 14px 0' }}>
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div style={{ borderTop: '1px solid #23233E' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid #23233E',
                  padding: '20px 0',
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
                      fontFamily: "'Oxanium', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: isOpen ? '#A78BFA' : '#FFFFFF',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {faq.q}
                  </span>
                  <div
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      color: '#9CA3AF',
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
                      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#9CA3AF', margin: '12px 0 0 0' }}>
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
          8. FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px 100px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            borderRadius: 24,
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(124, 58, 237, 0.2)',
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 40,
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 16px 0',
              }}
            >
              Apni Life Ka Next Level Unlock Karo 🇮🇳
            </h2>
            <p style={{ fontSize: 16, color: '#D1D5DB', margin: '0 0 32px 0', lineHeight: 1.6 }}>
              Join 50,000+ Indian achievers building permanent discipline and conquering their life goals. Free forever.
            </p>
            <Link
              href="/login"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 16,
                fontWeight: 700,
                padding: '16px 36px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 0 30px rgba(124, 58, 237, 0.6)',
                border: '1px solid rgba(167, 139, 250, 0.5)',
              }}
            >
              <Zap size={18} className="text-amber-400" />
              <span>Create Your Character (Free)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          9. FOOTER
      ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid #23233E',
          background: '#070710',
          padding: '50px 24px 30px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Swords size={16} color="#FFFFFF" />
              </div>
              <span style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>
                LIFE RPG OS INDIA
              </span>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#features" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>
                Features
              </a>
              <a href="#how-it-works" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>
                How It Works
              </a>
              <a href="#pricing" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>
                Pricing (₹)
              </a>
              <a href="#faq" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: 14 }}>
                FAQ
              </a>
              <Link href="/login" style={{ color: '#A78BFA', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                Login Portal
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #1F2038',
              paddingTop: 20,
              fontSize: 13,
              color: '#6B7280',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>© {new Date().getFullYear()} Life RPG OS India. Crafted with ❤️ for Indian Achievers.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link href="/privacy" style={{ color: '#6B7280', textDecoration: 'none' }}>Privacy</Link>
              <Link href="/terms" style={{ color: '#6B7280', textDecoration: 'none' }}>Terms</Link>
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
          .testimonials-grid, .steps-grid, .pricing-grid, .stats-grid, .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
