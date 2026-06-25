-- ============================================================
-- Life RPG OS — Day 4 SQL
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ACHIEVEMENT DEFINITIONS (master list)
create table if not exists public.achievement_definitions (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  name text not null,
  description text not null,
  emoji text not null,
  rarity text default 'common' check (rarity in ('common','rare','epic','legendary')),
  category text check (category in ('streaks','xp','level','social','quests','stats','special','seasonal')),
  requirement_type text not null check (requirement_type in (
    'streak_days','total_xp','level_reached','quests_completed',
    'stat_value','party_joined','couple_linked','reactions_sent','days_active','special'
  )),
  requirement_value integer not null default 1,
  xp_reward integer default 50,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Insert achievement definitions (skip if already exist)
insert into public.achievement_definitions
  (key, name, description, emoji, rarity, category, requirement_type, requirement_value, xp_reward)
values
  ('first_quest', 'First Step', 'Complete your very first quest', '⚔️', 'common', 'quests', 'quests_completed', 1, 25),
  ('streak_3', 'Warm Up', '3 day streak — you are building something', '🔥', 'common', 'streaks', 'streak_days', 3, 50),
  ('streak_7', '7-Day Warrior', 'A full week of showing up', '⚡', 'rare', 'streaks', 'streak_days', 7, 100),
  ('streak_14', 'Two Weeks Strong', 'Habit is forming', '💪', 'rare', 'streaks', 'streak_days', 14, 150),
  ('streak_30', 'Iron Discipline', '30 days. You are different now.', '🛡️', 'epic', 'streaks', 'streak_days', 30, 300),
  ('streak_60', 'Unbreakable', '60 days. This is who you are.', '👑', 'epic', 'streaks', 'streak_days', 60, 500),
  ('streak_100', 'Legendary Streak', '100 days. Hall of fame.', '🌟', 'legendary', 'streaks', 'streak_days', 100, 1000),
  ('xp_100', 'First XP', 'Earn your first 100 XP', '✨', 'common', 'xp', 'total_xp', 100, 25),
  ('xp_500', 'XP Collector', 'Earned 500 total XP', '⚡', 'common', 'xp', 'total_xp', 500, 50),
  ('xp_1000', 'Power Player', '1,000 XP earned', '💥', 'rare', 'xp', 'total_xp', 1000, 100),
  ('xp_5000', 'XP Machine', '5,000 total XP', '🔮', 'epic', 'xp', 'total_xp', 5000, 250),
  ('xp_10000', 'XP Legend', '10,000 total XP. Absolute unit.', '👑', 'legendary', 'xp', 'total_xp', 10000, 500),
  ('level_5', 'Rising', 'Reach Level 5', '📈', 'common', 'level', 'level_reached', 5, 50),
  ('level_10', 'Adventurer', 'Reach Level 10', '🗡️', 'rare', 'level', 'level_reached', 10, 100),
  ('level_25', 'Veteran', 'Reach Level 25', '🏅', 'epic', 'level', 'level_reached', 25, 300),
  ('level_50', 'Elite', 'Reach Level 50. You are in rare company.', '💎', 'epic', 'level', 'level_reached', 50, 600),
  ('level_100', 'Grandmaster', 'Level 100. Maximum prestige.', '👑', 'legendary', 'level', 'level_reached', 100, 2000),
  ('quests_10', 'Quest Runner', 'Complete 10 total quests', '🎯', 'common', 'quests', 'quests_completed', 10, 50),
  ('quests_50', 'Quest Veteran', 'Complete 50 total quests', '⚔️', 'rare', 'quests', 'quests_completed', 50, 150),
  ('quests_100', 'Century', '100 quests completed', '💯', 'epic', 'quests', 'quests_completed', 100, 300),
  ('quests_500', 'Relentless', '500 quests completed. Insane.', '🌟', 'legendary', 'quests', 'quests_completed', 500, 1000),
  ('perfect_day', 'Perfect Day', 'Complete ALL your quests in one day', '✅', 'rare', 'quests', 'special', 1, 100),
  ('str_10', 'Gym Beginner', 'Strength stat reaches 10', '💪', 'common', 'stats', 'stat_value', 10, 50),
  ('int_10', 'Student', 'Intelligence stat reaches 10', '📚', 'common', 'stats', 'stat_value', 10, 50),
  ('all_stats_5', 'Balanced Build', 'All 6 stats reach 5+', '⚖️', 'rare', 'stats', 'special', 1, 200),
  ('party_joined', 'Not Alone', 'Join or create a party', '👥', 'common', 'social', 'party_joined', 1, 50),
  ('couple_linked', 'Power Couple', 'Link with a partner', '💑', 'rare', 'social', 'couple_linked', 1, 100),
  ('night_owl', 'Night Owl', 'Complete a quest after midnight', '🦉', 'rare', 'special', 'special', 1, 100),
  ('early_bird', 'Early Bird', 'Complete a quest before 6am', '🌅', 'rare', 'special', 'special', 1, 100),
  ('comeback_kid', 'Comeback Kid', 'Return after missing 7+ days', '💫', 'epic', 'special', 'special', 1, 200),
  ('monday_warrior', 'Monday Warrior', 'Complete all quests on 4 Mondays', '📅', 'rare', 'special', 'special', 1, 150)
on conflict (key) do nothing;

-- USER ACHIEVEMENTS (earned badges per user)
create table if not exists public.user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_key text references public.achievement_definitions(key),
  earned_at timestamptz default now(),
  unique(user_id, achievement_key)
);

alter table public.user_achievements enable row level security;
create policy if not exists "users_own_achievements"
  on public.user_achievements for all
  using (auth.uid() = user_id);

alter table public.achievement_definitions enable row level security;
create policy if not exists "achievements_readable_by_all"
  on public.achievement_definitions for select
  using (true);

-- DAILY STATS SNAPSHOTS
create table if not exists public.daily_stats_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  snapshot_date date not null default current_date,
  str integer default 0,
  int integer default 0,
  wis integer default 0,
  vit integer default 0,
  gold integer default 0,
  cha integer default 0,
  level integer default 1,
  total_xp integer default 0,
  quests_completed integer default 0,
  unique(user_id, snapshot_date)
);

alter table public.daily_stats_snapshots enable row level security;
create policy if not exists "users_own_snapshots"
  on public.daily_stats_snapshots for all
  using (auth.uid() = user_id);

-- FUNCTION: Check and award achievements
create or replace function public.check_and_award_achievements(p_user_id uuid)
returns json as $$
declare
  v_profile public.profiles%rowtype;
  v_stats public.stats%rowtype;
  v_total_quests integer;
  v_in_party boolean;
  v_in_couple boolean;
  v_new_achievements json[] := '{}';
  v_def record;
  v_already_earned boolean;
  v_qualifies boolean;
  v_all_stats_5 boolean;
begin
  select * into v_profile from public.profiles where id = p_user_id;
  select * into v_stats from public.stats where user_id = p_user_id;

  select count(*) into v_total_quests from public.habit_completions where user_id = p_user_id;

  begin
    select exists(select 1 from public.party_members where user_id = p_user_id) into v_in_party;
  exception when undefined_table then v_in_party := false;
  end;

  begin
    select exists(
      select 1 from public.couple_links
      where (user_1 = p_user_id or user_2 = p_user_id) and status = 'active'
    ) into v_in_couple;
  exception when undefined_table then v_in_couple := false;
  end;

  v_all_stats_5 := (
    coalesce(v_stats.str, 0) >= 5 and coalesce(v_stats.int, 0) >= 5 and
    coalesce(v_stats.wis, 0) >= 5 and coalesce(v_stats.vit, 0) >= 5 and
    coalesce(v_stats.gold, 0) >= 5 and coalesce(v_stats.cha, 0) >= 5
  );

  for v_def in select * from public.achievement_definitions loop
    select exists(
      select 1 from public.user_achievements
      where user_id = p_user_id and achievement_key = v_def.key
    ) into v_already_earned;

    if v_already_earned then continue; end if;

    v_qualifies := case v_def.requirement_type
      when 'streak_days'      then coalesce(v_profile.streak, 0) >= v_def.requirement_value
      when 'total_xp'         then coalesce(v_profile.xp, 0) >= v_def.requirement_value
      when 'level_reached'    then coalesce(v_profile.level, 1) >= v_def.requirement_value
      when 'quests_completed' then v_total_quests >= v_def.requirement_value
      when 'party_joined'     then coalesce(v_in_party, false)
      when 'couple_linked'    then coalesce(v_in_couple, false)
      when 'stat_value'       then (coalesce(v_stats.str,0) >= v_def.requirement_value or coalesce(v_stats.int,0) >= v_def.requirement_value)
      when 'special'          then case v_def.key when 'all_stats_5' then v_all_stats_5 else false end
      else false
    end;

    if v_qualifies then
      insert into public.user_achievements (user_id, achievement_key)
      values (p_user_id, v_def.key) on conflict do nothing;

      update public.profiles set xp = xp + v_def.xp_reward, updated_at = now() where id = p_user_id;

      v_new_achievements := v_new_achievements || json_build_object(
        'key', v_def.key, 'name', v_def.name, 'emoji', v_def.emoji,
        'rarity', v_def.rarity, 'xp_reward', v_def.xp_reward, 'description', v_def.description
      )::json;
    end if;
  end loop;

  -- Daily snapshot
  insert into public.daily_stats_snapshots
    (user_id, snapshot_date, str, int, wis, vit, gold, cha, level, total_xp, quests_completed)
  values (p_user_id, current_date,
    coalesce(v_stats.str,0), coalesce(v_stats.int,0), coalesce(v_stats.wis,0),
    coalesce(v_stats.vit,0), coalesce(v_stats.gold,0), coalesce(v_stats.cha,0),
    coalesce(v_profile.level,1), coalesce(v_profile.xp,0), v_total_quests)
  on conflict (user_id, snapshot_date) do update set
    str=excluded.str, int=excluded.int, wis=excluded.wis, vit=excluded.vit,
    gold=excluded.gold, cha=excluded.cha, level=excluded.level,
    total_xp=excluded.total_xp, quests_completed=excluded.quests_completed;

  return json_build_object('new_achievements', v_new_achievements);
end;
$$ language plpgsql security definer;

-- UPDATED complete_habit RPC
create or replace function public.complete_habit(
  p_habit_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
returns json as $$
declare
  v_habit public.habits%rowtype;
  v_profile public.profiles%rowtype;
  v_xp_multiplier numeric := 1.0;
  v_current_streak integer := 1;
  v_leveled_up boolean := false;
  v_new_level integer;
  v_new_achievements json;
  v_today date := current_date;
  v_already_done boolean;
begin
  select * into v_habit from public.habits where id = p_habit_id and user_id = p_user_id;
  if not found then raise exception 'Habit not found'; end if;

  select exists(
    select 1 from public.habit_completions
    where habit_id = p_habit_id and user_id = p_user_id and completed_at::date = v_today
  ) into v_already_done;
  if v_already_done then
    return json_build_object('success', false, 'message', 'Already completed today');
  end if;

  insert into public.habit_completions (habit_id, user_id, completed_at, xp_earned)
  values (p_habit_id, p_user_id, now(), v_habit.xp_reward);

  select * into v_profile from public.profiles where id = p_user_id;
  if v_profile.last_active_date = v_today - 1 then
    v_current_streak := coalesce(v_profile.streak, 0) + 1;
  elsif v_profile.last_active_date = v_today then
    v_current_streak := coalesce(v_profile.streak, 1);
  else
    v_current_streak := 1;
  end if;

  if v_current_streak >= 7 then v_xp_multiplier := 1.5;
  elsif v_current_streak >= 3 then v_xp_multiplier := 1.25;
  end if;

  update public.profiles set
    xp = xp + floor(v_habit.xp_reward * v_xp_multiplier),
    streak = v_current_streak,
    last_active_date = v_today,
    updated_at = now()
  where id = p_user_id;

  execute format(
    'update public.stats set %I = %I + $1, updated_at = now() where user_id = $2',
    v_habit.stat_category, v_habit.stat_category
  ) using v_habit.stat_boost, p_user_id;

  loop
    select * into v_profile from public.profiles where id = p_user_id;
    exit when coalesce(v_profile.xp, 0) < coalesce(v_profile.xp_to_next, 100);
    update public.profiles set
      xp = xp - xp_to_next,
      level = level + 1,
      xp_to_next = (level + 1) * 100,
      updated_at = now()
    where id = p_user_id;
    v_leveled_up := true;
    v_new_level := v_profile.level + 1;
  end loop;

  begin
    perform public.upsert_weekly_snapshot(p_user_id);
  exception when undefined_function then null;
  end;

  select public.check_and_award_achievements(p_user_id) into v_new_achievements;

  return json_build_object(
    'success', true,
    'xp_earned', floor(v_habit.xp_reward * v_xp_multiplier),
    'multiplier', v_xp_multiplier,
    'streak', v_current_streak,
    'leveled_up', v_leveled_up,
    'new_level', v_new_level,
    'new_achievements', v_new_achievements->'new_achievements'
  );
end;
$$ language plpgsql security definer;
