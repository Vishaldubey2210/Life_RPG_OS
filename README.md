# ⚔️ Life RPG OS

> Turn daily habits into quests. Earn XP, build streaks, and level up your real life.

[**Open the live app →**](https://life-rpg-os-chi.vercel.app/)

Life RPG OS is a gamified habit and personal-growth platform. It combines daily quests, RPG-style character progression, social accountability, analytics, and AI coaching in one responsive web app.

## Live preview

**Production URL:** [life-rpg-os-chi.vercel.app](https://life-rpg-os-chi.vercel.app/)

| Landing page | Authentication |
| --- | --- |
| ![Life RPG OS landing page](./public/screenshots/preview-01.png) | ![Life RPG OS authentication screen](./public/screenshots/preview-02.png) |
| Dashboard | Quest management |
| ![Life RPG OS dashboard](./public/screenshots/preview-03.png) | ![Life RPG OS quest management](./public/screenshots/preview-04.png) |
| Analytics | Social features |
| ![Life RPG OS analytics](./public/screenshots/preview-05.png) | ![Life RPG OS social features](./public/screenshots/preview-06.png) |

## What is included

- **Authentication and onboarding** — Email/password and Google sign-in, character creation, profile, and stat setup.
- **Quest system** — Create and complete habits as quests, gain XP, maintain streaks, and level up.
- **RPG progression** — Six core stats, health, XP bars, level-up effects, achievements, and skill-tree progression.
- **AI coach** — Context-aware coaching and weekly reports powered by Groq.
- **Social accountability** — Parties, invite links, couple mode, leaderboards, and shareable progress cards.
- **Insights** — Analytics, achievement history, trend views, and daily progress tracking.
- **Admin tools** — Admin access controls, feedback management, live app configuration, and error-log viewer.
- **PWA support** — Install prompt, web manifest, service worker, and optional push notifications.

## Project status

| Area | Status |
| --- | --- |
| Next.js app | Deployed on Vercel |
| Authentication and database | Supabase Cloud |
| Production URL | [Open app](https://life-rpg-os-chi.vercel.app/) |
| Build verification | `npm run build` passes locally |
| Scheduled jobs | Daily metrics, reminder, and weekly snapshot endpoints configured in `vercel.json` |

Before inviting users, complete the database migrations and production authentication settings listed below.

## Tech stack

- [Next.js 16](https://nextjs.org/) + React 19 + TypeScript
- Tailwind CSS 4 + Framer Motion
- Supabase Auth, Postgres, RLS, and Realtime
- TanStack Query for client-side data caching
- Groq for AI coaching
- Recharts for analytics
- Vercel OG for sharing cards
- `next-pwa` and Web Push APIs

## Run locally

```bash
npm install
npm run dev
```

Create `.env.local` with the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=your-groq-key
CRON_SECRET=a-long-random-string
```

Never commit `.env.local` or server-only keys.

## Supabase setup

Run these scripts in the Supabase SQL Editor, in order:

1. `supabase-schema.sql`
2. `supabase-day4.sql`
3. `supabase-day5-referral.sql`
4. `supabase-day6-admin.sql`

Then configure Supabase Auth:

- Enable Email/Password authentication.
- Set the Site URL to your Vercel production URL.
- Add both `http://localhost:3000/**` and `https://your-domain.vercel.app/**` under Redirect URLs.
- Configure Google OAuth in Supabase and Google Cloud if Google sign-in is enabled.

## Deploy

The app is designed for Vercel deployment:

1. Import the GitHub repository in Vercel.
2. Use the default Next.js build settings (`npm run build`).
3. Add the environment variables above in Vercel for Production and Preview.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Update Supabase Auth Site URL and Redirect URLs, then redeploy.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the deployment checklist, [FEATURES.md](./FEATURES.md) for product details, and [API.md](./API.md) for API notes.

## License

Private project — all rights reserved.
