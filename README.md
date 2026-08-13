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

---

## 🗄️ Database Architecture & Schema

Life RPG OS relies on a robust PostgreSQL schema implemented on Supabase with strict Row Level Security (RLS) policies.

### 1. `profiles` Table
Stores user profile information, experience, level progression, and current active streak.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_emoji text default '⚔️',
  level integer default 1,
  xp integer default 0,
  xp_to_next integer default 100,
  hp integer default 100,
  hp_max integer default 100,
  streak integer default 0,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2. `stats` Table
Tracks character attributes representing different domains of personal growth.

```sql
create table public.stats (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  str integer default 1, -- Physical fitness & discipline
  int integer default 1, -- Learning, reading & coding
  wis integer default 1, -- Mindfulness, mental clarity & focus
  vit integer default 1, -- Health, sleep & nutrition
  gold integer default 1, -- Financial habits & economy
  cha integer default 1  -- Social connections & communication
);
```

### 3. `habits` Table
Defines active quests, difficulty tier, XP yield, and associated stat boost domain.

```sql
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  difficulty text not null, -- 'easy', 'medium', 'hard'
  xp_reward integer not null,
  stat_category text not null, -- 'str', 'int', 'wis', 'vit', 'gold', 'cha'
  emoji text default '📋',
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 4. `habit_completions` Table
Logs completion timestamps for quests, driving historical charts, streaks, and analytics.

```sql
create table public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 5. `achievement_definitions` & `user_achievements` Tables
Defines systemic milestones, badges, rarity, requirement triggers, and unlocked user trophies.

```sql
create table if not exists public.achievement_definitions (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  name text not null,
  description text not null,
  emoji text not null,
  rarity text default 'common' check (rarity in ('common','rare','epic','legendary')),
  category text check (category in ('streaks','xp','level','social','quests','stats','special','seasonal')),
  requirement_type text not null,
  requirement_value integer not null default 1,
  xp_reward integer default 50
);

create table if not exists public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_key text references public.achievement_definitions(key),
  earned_at timestamptz default now(),
  unique(user_id, achievement_key)
);
```

### 6. `daily_stats_snapshots` Table
Snapshots user stats on a daily basis to generate analytics charts and power week-over-week performance tracking.

```sql
create table if not exists public.daily_stats_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  snapshot_date date not null default current_date,
  str integer default 0, int integer default 0, wis integer default 0,
  vit integer default 0, gold integer default 0, cha integer default 0,
  level integer default 1, total_xp integer default 0, quests_completed integer default 0,
  unique(user_id, snapshot_date)
);
```

---

## ⚙️ PostgreSQL Stored Procedures (RPCs)

Life RPG OS utilizes atomic PostgreSQL stored procedures to guarantee real-time state integrity, instant level-up mechanics, streak calculations, and achievement evaluations.

### `complete_habit(p_habit_id uuid)` RPC Function
- Validates user identity via Supabase Auth (`auth.uid()`).
- Verifies quest active state and prevents duplicate completions on the same day.
- Dynamically computes streak multipliers:
  - **3+ Day Streak**: `1.25x` XP bonus.
  - **7+ Day Streak**: `1.50x` XP bonus.
- Awards XP and stat boosts to the profile (`STR`, `INT`, `WIS`, `VIT`, `GOLD`, `CHA`).
- Evaluates level progression: if `XP >= XP_to_next`, increments level, recalculates next threshold, and resets HP.
- Calls `check_and_award_achievements()` automatically to check if any achievement triggers were satisfied.
- Returns a JSON response containing `xp_earned`, `multiplier`, `streak`, `leveled_up`, and `new_achievements`.

```sql
select public.complete_habit('your-habit-uuid-here');
```

---

## 🤖 AI Growth Coach (Groq Integration)

Life RPG OS features a built-in AI Personal Coach that acts as an in-game questgiver, mentor, and productivity strategist.

### Architecture & Prompt Context Injection
The coach route (`/api/coach`) fetches the user's active context from PostgreSQL:
1. **Profile Level & Current Streak**
2. **Current RPG Stats** (`STR`, `INT`, `WIS`, `VIT`, `GOLD`, `CHA`)
3. **Active Quests & Weekly Completion History**

This structured context is injected dynamically into the system prompt. The model delivers gamified, realistic, and actionable advice via streaming responses using server-sent events (`TextEncoder` stream).

```typescript
// AI Coach invocation example
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const stream = await groq.chat.completions.create({
  model: 'llama-3.1-70b-versatile',
  messages: [
    { role: 'system', content: systemWithUserRPGContext },
    ...userMessages
  ],
  stream: true,
})
```

---

## 👥 Multiplayer Parties & 💑 Couple Mode

### 👥 Co-Op Parties
- **Party Creation & Joining**: Users can generate a unique 6-character invitation code to build adventuring guilds with up to 6 members.
- **Realtime Synchronization**: Uses Supabase Realtime subscriptions to push immediate party updates whenever a teammate completes a quest or levels up.
- **Guild Leaderboards**: Ranks party members by weekly XP contributions.

### 💑 Couple Mode
- **Dual-Player Guild**: Form a dedicated 2-person squad with your partner.
- **Shared Accountability**: View your partner's active quests, daily completion percentage, and streak status.
- **Milestone Rewards**: Unlock special dual-achievements such as *Power Couple* upon completing joint habits.

---

## ⚡ Getting Started & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project account
- A [Groq API](https://groq.com/) key (for AI Coach features)

### 1. Repository Setup
```bash
git clone https://github.com/Vishaldubey2210/Life_RPG_OS.git
cd Life_RPG_OS
```

### 2. Environment Variables Configuration
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=gsk_your_groq_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration
Execute the SQL files in your Supabase SQL Editor in the following sequence:
1. Run `supabase-schema.sql` (Creates core tables: `profiles`, `stats`, `habits`, `habit_completions`, triggers, and `complete_habit` RPC).
2. Run `supabase-day4.sql` (Creates `achievement_definitions`, `user_achievements`, `daily_stats_snapshots`, and `check_and_award_achievements` RPC).

### 4. Install Dependencies
```bash
npm install
```

---

## 🏃 Running the Application

### Development Server
Run the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start your RPG journey!

### Production Build & Linting
Validate type safety and compile optimized production assets:

```bash
# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📜 License & Acknowledgments

Distributed under the MIT License. See `LICENSE` for more details.

Built with ❤️ by [Vishal Dubey](https://github.com/Vishaldubey2210).

---

<p align="center">
  <b>Level Up Your Life Everyday ⚔️✨</b>
</p>
