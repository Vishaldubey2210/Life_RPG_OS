# ⚔️ Life RPG OS ⚔️

> **Level up your Life, one Habit and Quest at a time.**

Welcome to **Life RPG OS**! Life RPG OS is an immersive, gamified productivity platform that transforms your daily habits, routines, and goals into an RPG (Role-Playing Game) adventure. Complete quests, build streaks, level up your character, allocate attribute points, form co-op parties, link with your partner in Couple Mode, receive personalized growth mentorship from an AI Coach, and share your achievements with the world.

---

## 🚀 Welcome to the Adventure

In the journey of life, productivity can feel like a grind. **Life RPG OS** re-engineers your daily task management into an engaging fantasy adventure. Whether you are studying, going to the gym, or working on code, every action yields XP, Gold, and Stat boosts.

*   **Gamified Daily Tracker**: Turn mundane tasks into epic Quests.
*   **RPG Stats System**: Grow your character's Strength, Intelligence, Wisdom, Vitality, and Charisma.
*   **Social Integration**: Party with friends, or link with a partner in Couple Mode.
*   **AI Coach**: Powered by Llama 3.1 on Groq, get dynamically tailored advice based on your real-life stats.
*   **Progressive Web App (PWA)**: Install directly on your phone's home screen for native-like performance.
*   **Viral Sharing & Referrals**: Share screenshot-worthy XP progress cards and earn 200 XP referral bonuses.

---

## ✨ Key Features

### 📰 High-Converting Landing Page (`/`)
- **Hero Section**: Starfield background animation, value proposition, CTA buttons, and floating character preview card.
- **Social Proof**: Auto-scrolling infinite marquee of user testimonials and reviews.
- **6-Module Feature Showcase**: Interactive cards detailing XP progression, skill tree, AI coach, party system, couple mode, and leaderboards.
- **3-Step Onboarding Preview**: Clear walkthrough from character creation to leveling up.
- **Transparent Pricing**: Adventurer (Free), Hero (Pro), and Legend (Guild) pricing tiers.
- **FAQ Accordion & CTA**: Answers to top user queries and quick email signup form.

### 📱 Progressive Web App (PWA) & Push Notifications
- **Installable Web App**: PWA manifest with multi-resolution maskable icons (72x72 to 512x512).
- **Service Worker (`sw.js`)**: Background caching and web push notification event handlers.
- **Custom Install Prompt**: In-app banner inviting users to add the app to their home screen.
- **Automated Daily Reminders**: Vercel cron job running at 8 PM IST to remind users to protect their streaks.

### 📤 Viral Sharing & Referral System
- **Dynamic XP Cards**: Powered by `@vercel/og`, generating shareable 400x700px image cards of user stats.
- **Native Mobile Share**: One-click sharing via Web Share API with image fallback.
- **Referral Rewards**: Unique invite codes (`/invite/[code]`) granting **200 bonus XP** to both referrer and new player.
- **Achievement Share Cards**: High-res share cards generated when legendary achievements are unlocked.

### 🔍 Complete SEO Suite
- **Dynamic OpenGraph Images**: Automatically generated social media preview cards for user profile URLs (`/profile/[username]`).
- **Structured Data**: JSON-LD `SoftwareApplication` schema for Google search rich snippets.
- **Sitemap & Robots**: Automated `sitemap.xml` and `robots.txt` generation for optimal search crawler indexing.

### 🎯 Quests & Habits System
- **Difficulty Scaling**: Quests categorized by Easy, Medium, and Hard, granting scaling XP and Gold rewards.
- **Stat Boosts**: Completing tasks raises specific RPG attributes (`STR`, `INT`, `WIS`, `VIT`, `CHA`).
- **Streak Multipliers**: Maintain daily completion streaks to unlock streak multipliers (up to 1.5x XP).
- **Auto Level-Up**: XP triggers automatic level ups with maximum HP resets and celebratory visual feedback.

### 👥 Multiplayer Co-Op Parties & Couple Mode
- **Party Hub**: Create or join adventuring parties with friends using unique invite codes.
- **Couple Mode**: Connect with your partner to embark on joint life quests and shared weekly report cards.

### 🤖 AI Coach Mentorship
- **Groq AI Integration**: Powered by `llama-3.1-70b-versatile`.
- **Context-Aware Recommendations**: Analyzes your actual user stats, habit completions, and active streaks to give tailored encouragement, tips, and strategic growth plans.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) | High-performance React framework with server and client components |
| **UI Library** | [React 19](https://react.dev/) | Modern UI primitives with server action integration |
| **PWA & Image Gen** | [next-pwa](https://www.npmjs.com/package/next-pwa) & [@vercel/og](https://vercel.com/docs/functions/og-image-generation) | Installable PWA support & dynamic OpenGraph card generation |
| **Push Notifications** | [web-push](https://www.npmjs.com/package/web-push) | Standardized VAPID Web Push protocol for browser notifications |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first CSS engine |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth animations for micro-interactions, level-ups, and modals |
| **Backend & Database** | [Supabase](https://supabase.com/) | PostgreSQL database, Auth, Row Level Security (RLS), and Realtime |
| **AI Integration** | [Groq SDK](https://groq.com/) | Ultra-fast inference running `llama-3.1-70b-versatile` |
| **Analytics & Data Vis** | [Recharts](https://recharts.org/) | Responsive SVG charts for tracking stat progression over time |
