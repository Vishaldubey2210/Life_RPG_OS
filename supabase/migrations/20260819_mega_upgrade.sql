-- ==============================================================================
-- LIFE RPG OS — MEGA UPGRADE CONSOLIDATED SCHEMA MIGRATION
-- ==============================================================================

-- 1. AI COACH MEMORY & CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.coach_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_type text CHECK (memory_type IN (
    'pattern','preference','goal','struggle',
    'milestone','personality','insight'
  )),
  content text NOT NULL,
  importance integer DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now(),
  last_referenced timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.coach_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own memory' AND tablename = 'coach_memory') THEN
    CREATE POLICY "Users own memory" ON public.coach_memory FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own conversations' AND tablename = 'coach_conversations') THEN
    CREATE POLICY "Users own conversations" ON public.coach_conversations FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coach_memory_user ON public.coach_memory(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_coach_conv_user ON public.coach_conversations(user_id, created_at DESC);


-- 2. WEEKLY FOCUS CHALLENGES
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  challenge_text text,
  target_stat text,
  target_completions integer DEFAULT 5,
  current_completions integer DEFAULT 0,
  bonus_xp integer DEFAULT 300,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own weekly challenges' AND tablename = 'weekly_challenges') THEN
    CREATE POLICY "Users own weekly challenges" ON public.weekly_challenges FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user ON public.weekly_challenges(user_id, week_start DESC);


-- 3. HABIT EXTENSIONS (SCHEDULING, STACKING & TEMPLATES)
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS scheduled_time text,
ADD COLUMN IF NOT EXISTS location_context text,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS trigger_habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS implementation_intention text,
ADD COLUMN IF NOT EXISTS template_id text;

CREATE TABLE IF NOT EXISTS public.template_downloads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view template downloads' AND tablename = 'template_downloads') THEN
    CREATE POLICY "Anyone can view template downloads" ON public.template_downloads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated insert template downloads' AND tablename = 'template_downloads') THEN
    CREATE POLICY "Authenticated insert template downloads" ON public.template_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- 4. JOURNAL SYSTEM & REFLECTIONS
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT current_date,
  entry_type text CHECK (entry_type IN (
    'quest_reflection','daily_summary',
    'mood_log','weekly_review','free_write'
  )),
  habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL,
  content text,
  mood_score integer CHECK (mood_score BETWEEN 1 AND 10),
  energy_score integer CHECK (energy_score BETWEEN 1 AND 10),
  tags text[] DEFAULT '{}',
  ai_insight text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own journal' AND tablename = 'journal_entries') THEN
    CREATE POLICY "Users own journal" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_journal_user_date ON public.journal_entries(user_id, entry_date DESC);


-- 5. FOCUS SESSIONS (DEEP WORK TIMER)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id uuid REFERENCES public.habits(id) ON DELETE SET NULL,
  session_type text DEFAULT 'pomodoro',
  planned_duration integer NOT NULL,
  actual_duration integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own focus sessions' AND tablename = 'focus_sessions') THEN
    CREATE POLICY "Users own focus sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON public.focus_sessions(user_id, started_at DESC);


-- 6. DAILY MOOD & ENERGY CHECK-INS
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT current_date,
  mood_score integer CHECK (mood_score BETWEEN 1 AND 5),
  energy_score integer CHECK (energy_score BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own checkins' AND tablename = 'daily_checkins') THEN
    CREATE POLICY "Users own checkins" ON public.daily_checkins FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON public.daily_checkins(user_id, checkin_date DESC);


-- 7. PARTY BOSS BATTLES & CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.boss_battles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id uuid REFERENCES public.parties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  emoji text DEFAULT '👹',
  difficulty text CHECK (difficulty IN ('normal','hard','legendary')),
  target_completions integer NOT NULL,
  current_completions integer DEFAULT 0,
  bonus_xp_per_member integer DEFAULT 500,
  bonus_badge_key text,
  start_date date NOT NULL DEFAULT current_date,
  end_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active','won','lost','cancelled')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.boss_contributions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boss_id uuid REFERENCES public.boss_battles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  completions_count integer DEFAULT 0,
  last_contributed timestamptz DEFAULT now(),
  UNIQUE(boss_id, user_id)
);

ALTER TABLE public.boss_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_contributions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Party members see boss' AND tablename = 'boss_battles') THEN
    CREATE POLICY "Party members see boss" ON public.boss_battles FOR ALL USING (
      party_id IN (SELECT party_id FROM public.party_members WHERE user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Party members see contributions' AND tablename = 'boss_contributions') THEN
    CREATE POLICY "Party members see contributions" ON public.boss_contributions FOR ALL USING (
      boss_id IN (
        SELECT id FROM public.boss_battles WHERE party_id IN (
          SELECT party_id FROM public.party_members WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;


-- 8. SHADOW CLONE DATA (WEEKLY HISTORICAL SNAPSHOTS)
CREATE TABLE IF NOT EXISTS public.shadow_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  daily_completions jsonb DEFAULT '{}',
  total_xp integer DEFAULT 0,
  habits_snapshot jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.shadow_data ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users own shadow data' AND tablename = 'shadow_data') THEN
    CREATE POLICY "Users own shadow data" ON public.shadow_data FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;


-- 9. PERSONALITY PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS personality_type jsonb DEFAULT '{}';


-- Add one point of raid damage after a successful habit completion. The boss row
-- is locked so concurrent party completions cannot lose progress.
CREATE OR REPLACE FUNCTION public.contribute_to_active_boss()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_boss_id uuid;
BEGIN
  SELECT b.id
    INTO v_boss_id
    FROM public.boss_battles b
    JOIN public.party_members pm ON pm.party_id = b.party_id
   WHERE pm.user_id = auth.uid()
     AND b.status = 'active'
     AND b.end_date >= current_date
   ORDER BY b.created_at DESC
   LIMIT 1
   FOR UPDATE OF b;

  IF v_boss_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.boss_battles
     SET current_completions = LEAST(current_completions + 1, target_completions),
         status = CASE WHEN current_completions + 1 >= target_completions THEN 'won' ELSE status END
   WHERE id = v_boss_id;

  INSERT INTO public.boss_contributions (boss_id, user_id, completions_count, last_contributed)
  VALUES (v_boss_id, auth.uid(), 1, now())
  ON CONFLICT (boss_id, user_id) DO UPDATE
     SET completions_count = public.boss_contributions.completions_count + 1,
         last_contributed = now();

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.contribute_to_active_boss() TO authenticated;
