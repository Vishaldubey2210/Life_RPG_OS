# Life RPG OS - Complete Feature Documentation

## 🎮 Overview

Life RPG OS is a gamified life management app built with **Next.js 16**, **Supabase**, and **TypeScript**. Turn your real-world habits and goals into a role-playing game where you level up, build your character, and join parties with friends.

**Live Features:**
- ✅ Character creation & progression system
- ✅ Habit completion & XP rewards with streak tracking
- ✅ Party system for social accountability  
- ✅ Couple linking for partnerships
- ✅ Leaderboard with real-time rankings
- ✅ Achievement system with rarity tiers
- ✅ Weekly coaching reports with AI insights
- ✅ Admin dashboard with user management
- ✅ Error logging & performance metrics
- ✅ Push notifications
- ✅ PWA with offline support
- ✅ Rate limiting & security

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 16 App Router, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, Node.js runtime
- **Database:** Supabase (PostgreSQL with RLS)
- **Authentication:** Supabase Auth (OAuth + Email)
- **Real-time:** Supabase Realtime
- **Hosting:** Vercel
- **AI:** Groq for coaching reports
- **Notifications:** Web Push API

### Directory Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── (auth)/         # Auth pages
│   ├── (marketing)/    # Public pages
│   └── ...             # Feature pages
├── components/         # React components
│   ├── layout/         # Layout components
│   ├── ui/             # UI components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── supabase/       # Supabase clients
│   └── ...             # Other utilities
└── providers/          # Context providers
```

## 🎯 Core Features

### 1. Character & Progression System
- **Stats:** STR, INT, WIS, VIT, GOLD, CHA (6 primary stats)
- **Levels:** Dynamic level progression based on XP
- **HP System:** Health pool that resets on level-up
- **Streaks:** Daily completion tracking with multipliers
- **Avatar:** Customizable emoji-based characters

**Database Tables:**
- `profiles` - User character data
- `stats` - Character stat progression
- `habits` - User-defined quests/habits
- `habit_completions` - Completion history

### 2. Habit System (Quests)
Users create habits across categories:
- **Difficulty:** Easy (10 XP), Medium (25 XP), Hard (50 XP)
- **Stat Mapping:** Each habit boosts one primary stat
- **Daily Limit:** One completion per habit per day
- **Streak Multiplier:** 3+ streaks = 1.25x XP

**Stored Procedure:** `complete_habit()` handles atomic transactions

### 3. Social Features

#### Party System
- Create or join parties
- Party chat & activity feed
- Shared party goals
- Social accountability

#### Couple System  
- Link accounts as couples
- Shared dashboard
- Couple-only stats
- Synchronized streaks

#### Leaderboard
- Ranked by total XP
- Weekly rankings
- Regional/global views
- Achievement badges

### 4. Achievement System
- **100+ achievements** across categories:
  - Streaks (3-day to 100-day)
  - XP milestones
  - Level thresholds
  - Social actions
  - Special events

- **Rarity Tiers:** Common, Rare, Epic, Legendary
- **XP Rewards:** 25-2000 XP per achievement
- **Notifications:** Real-time unlock alerts

### 5. Coaching System
- **Weekly Reports:** AI-powered insights via Groq
- **Habit Analysis:** Completion patterns & trends
- **Goal Suggestions:** Personalized recommendations
- **Motivational Messages:** Context-aware encouragement

**API:** `/api/coach/weekly-report`

### 6. Admin Dashboard
**Features:**
- Real-time KPI overview (users, DAU, retention)
- User management (suspend/admin/promote)
- Feedback management (bug reports, feature requests)
- System metrics & error logs
- Global announcements
- Feature flag toggles

**Pages:**
- `/admin` - Overview & KPIs
- `/admin/users` - User list & controls
- `/admin/feedback` - Feedback triage

### 7. Monitoring & Analytics
- **Error Logging:** Automatic error capture in `error_logs` table
- **System Metrics:** Daily aggregated stats via cron
- **Analytics API:** `/api/analytics/insights`
- **Performance:** Bundle size < 200KB gzip

### 8. Mobile Experience
- **PWA:** Full offline support
- **Responsive:** Mobile-first design
- **Gestures:** Swipe support for habit actions
- **App Install:** Native app feel on iOS/Android
- **Push Notifications:** Real-time updates

### 9. Security Features
- **RLS Policies:** Row-level security on all tables
- **Rate Limiting:** 60 req/min per IP (configurable)
- **CORS:** Strict origin validation
- **Auth Gating:** Middleware-enforced auth on protected routes
- **User Suspension:** Admin-controlled account suspension
- **Maintenance Mode:** Global system-level maintenance gate

## 📊 Database Schema

### Core Tables
```sql
-- User data
profiles (id, display_name, level, xp, hp, streak, is_admin, is_suspended)
stats (user_id, str, int, wis, vit, gold, cha)

-- Habits & Completions
habits (id, user_id, name, difficulty, xp_reward, stat_category, emoji)
habit_completions (id, habit_id, user_id, completed_at)

-- Social
parties (id, name, code, created_by)
party_members (party_id, user_id, joined_at)
couple_links (user_id_1, user_id_2, linked_at)

-- Achievements
achievement_definitions (id, key, name, description, emoji, rarity)
user_achievements (id, user_id, achievement_id, earned_at)

-- System
app_config (key, value, description)
error_logs (id, user_id, error_type, severity, created_at)
system_metrics (id, metric_type, metric_name, metric_value, recorded_at)
feedback (id, user_id, feedback_type, title, body, status)
notifications (id, user_id, title, body, notification_type, is_read)
```

### Stored Procedures
- `complete_habit()` - Atomic habit completion with XP calc
- `generate_daily_metrics()` - Daily aggregation of stats
- `handle_new_user()` - Trigger for auth signup

## 🔌 API Routes

### Public Routes
- `GET /` - Homepage
- `GET /auth/callback` - OAuth callback

### Protected Routes (Auth Required)
- `POST /api/coach/weekly-report` - Get AI coaching report
- `POST /api/notifications/read` - Mark notifications as read
- `POST /api/push/subscribe` - Register push subscription
- `POST /api/push/send` - Send notification

### Admin Routes (Admin Only)
- `GET /admin` - Overview dashboard
- `GET /admin/users` - User management
- `GET /admin/feedback` - Feedback triage

### Cron Routes (CRON_SECRET Required)
- `GET /api/cron/daily-reminder` - Send daily reminders
- `GET /api/cron/daily-metrics` - Calculate daily metrics
- `GET /api/cron/weekly-snapshot` - Weekly report generation

### Analytics Routes
- `GET /api/analytics/insights` - User insights

## 🚀 Deployment

### Quick Start
```bash
# 1. Clone & install
git clone <repo>
cd life-rpg-os
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase & Vercel config

# 3. Run migrations
# Navigate to Supabase SQL editor and run:
# - supabase-schema.sql
# - supabase-day4.sql (achievements)
# - supabase-day5-referral.sql (referrals)
# - supabase-day6-admin.sql (admin tables)

# 4. Local development
npm run dev
# Visit http://localhost:3000

# 5. Deploy to Vercel
vercel --prod
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
CRON_SECRET=your-strong-secret
GROQ_API_KEY=your-groq-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

## 🧪 Testing

```bash
# Build verification
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Development Notes

### Key Patterns
1. **Client Components:** Interactive features marked with `'use client'`
2. **Server Components:** Default for data fetching & auth checks
3. **Middleware:** Auth gating & maintenance mode in `src/lib/supabase/middleware.ts`
4. **Hooks:** Custom hooks in `src/hooks/` for state management
5. **RLS:** All database access protected by row-level security policies

### Common Tasks

**Add a New Habit Category**
1. Add stat to `STAT_CONFIG` in components
2. Create habits with corresponding stat_category
3. Update achievement definitions if needed

**Create New Admin Metric**
1. Add calculation to `generate_daily_metrics()` function
2. Insert into `system_metrics` table
3. Query in admin dashboard component

**Add Achievement**
1. Insert into `achievement_definitions` table
2. Create trigger or manual check logic
3. Notify user via `notifications` table

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth not working | Check SUPABASE_URL & ANON_KEY |
| Admin routes 401 | Verify user has `is_admin = true` |
| Cron jobs not running | Check CRON_SECRET matches Vercel config |
| Database errors | Review RLS policies & user permissions |
| Slow performance | Check query logs, enable caching |

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🎉 Credits

Built with ❤️ for habit-building gamers everywhere.

---

**Questions?** Check the GitHub issues or reach out to the team.
