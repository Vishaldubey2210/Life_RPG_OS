# ⚔️ Life RPG OS ⚔️

> **Level up your Life, one Habit and Quest at a time.**

Welcome to **Life RPG OS**! Life RPG OS is an immersive, gamified productivity platform that transforms your daily habits, routines, and goals into an RPG (Role-Playing Game) adventure. Complete quests, build streaks, level up your character, allocate attribute points, form co-op parties, link with your partner in Couple Mode, and receive personalized growth mentorship from an AI Coach.

---

## 🚀 Welcome to the Adventure

In the journey of life, productivity can feel like a grind. **Life RPG OS** re-engineers your daily task management into an engaging fantasy adventure. Whether you are studying, going to the gym, or working on code, every action yields XP, Gold, and Stat boosts.

*   **Gamified Daily Tracker**: Turn mundane tasks into epic Quests.
*   **RPG Stats System**: Grow your character's Strength, Intelligence, Wisdom, Vitality, and Charisma.
*   **Social Integration**: Party with friends, or link with a partner in Couple Mode.
*   **AI Coach**: Powered by Llama 3.1 on Groq, get dynamically tailored advice based on your real-life stats.

---

## ✨ Key Features

### 🎯 Quests & Habits System
- **Difficulty Scaling**: Quests categorized by Easy, Medium, and Hard, granting scaling XP and Gold rewards.
- **Stat Boosts**: Completing tasks raises specific RPG attributes (`STR`, `INT`, `WIS`, `VIT`, `CHA`).
- **Streak Multipliers**: Maintain daily completion streaks to unlock streak multipliers (up to 1.5x XP).
- **Auto Level-Up**: XP triggers automatic level ups with maximum HP resets and celebratory visual feedback.

### 👥 Multiplayer Co-Op Parties
- **Party Hub**: Create or join adventuring parties with friends using unique invite codes.
- **Shared Party Stats**: Compare total XP, party level, and member activity in real-time.
- **Party Chat & Activity Stream**: Cheer on party members as they complete quests and gain achievements.

### 💑 Couple Mode
- **Partner Linking**: Connect with your partner to embark on joint life quests.
- **Co-Op Questing**: Build habit accountability together and shared achievement milestones.

### 🤖 AI Coach Mentorship
- **Groq AI Integration**: Powered by `llama-3.1-70b-versatile`.
- **Context-Aware Recommendations**: Analyzes your actual user stats, habit completions, and active streaks to give tailored encouragement, tips, and strategic growth plans.

### 🏆 Achievements & Badges
- **Tiered Badges**: Earn Common, Rare, Epic, and Legendary achievements.
- **Special Milestones**: Unlock badges for streak milestones (3-day, 7-day, 30-day, 100-day), XP thresholds, and special time-based quests (Night Owl, Early Bird, Monday Warrior).

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router) | High-performance React framework with server and client components |
| **UI Library** | [React 19](https://react.dev/) | Modern UI primitives with server action integration |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first CSS engine |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth animations for micro-interactions, level-ups, and modals |
| **Backend & Database** | [Supabase](https://supabase.com/) | PostgreSQL database, Auth, Row Level Security (RLS), and Realtime |
| **AI Integration** | [Groq SDK](https://groq.com/) | Ultra-fast inference running `llama-3.1-70b-versatile` |
| **Analytics & Data Vis** | [Recharts](https://recharts.org/) | Responsive SVG charts for tracking stat progression over time |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com/) | Accessible drag-and-drop primitives for habit organization |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/) | Beautiful icon set and toast notification banners |
| **Celebrations** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Visual particle confetti bursts upon quest completions |
