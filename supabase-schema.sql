-- Supabase Database Schema for Life RPG OS

-- 1. Profiles Table
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

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);


-- 2. Stats Table
create table public.stats (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  str integer default 1,
  int integer default 1,
  wis integer default 1,
  vit integer default 1,
  gold integer default 1,
  cha integer default 1
);

-- Enable RLS on Stats
alter table public.stats enable row level security;

create policy "Users can view their own stats" 
  on public.stats for select 
  using (auth.uid() = user_id);

create policy "Users can update their own stats" 
  on public.stats for update 
  using (auth.uid() = user_id);

create policy "Users can insert their own stats" 
  on public.stats for insert 
  with check (auth.uid() = user_id);


-- 3. Habits (Quests) Table
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

-- Enable RLS on Habits
alter table public.habits enable row level security;

create policy "Users can view their own habits" 
  on public.habits for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own habits" 
  on public.habits for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own habits" 
  on public.habits for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own habits" 
  on public.habits for delete 
  using (auth.uid() = user_id);


-- 4. Habit Completions Table
create table public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Habit Completions
alter table public.habit_completions enable row level security;

create policy "Users can view their own habit completions" 
  on public.habit_completions for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own habit completions" 
  on public.habit_completions for insert 
  with check (auth.uid() = user_id);


-- 5. Automate Profile Creation on auth.users Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_emoji, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Adventurer'),
    '⚔️',
    false
  );

  insert into public.stats (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 6. Stored Database Procedure to Complete a Habit / Quest
create or replace function public.complete_habit(p_habit_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_xp_reward integer;
  v_stat_category text;
  v_difficulty text;
  v_current_xp integer;
  v_xp_to_next integer;
  v_level integer;
  v_streak integer;
  v_multiplier numeric;
  v_xp_earned integer;
  v_leveled_up boolean := false;
  v_today date;
  v_already_completed integer;
begin
  -- Get active user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get habit details and verify ownership
  select xp_reward, stat_category, difficulty
  into v_xp_reward, v_stat_category, v_difficulty
  from public.habits
  where id = p_habit_id and user_id = v_user_id and is_active = true;

  if not found then
    raise exception 'Quest not found or inactive';
  end if;

  -- Check if already completed today (UTC or local database date)
  v_today := current_date;
  select count(*)
  into v_already_completed
  from public.habit_completions
  where habit_id = p_habit_id 
    and user_id = v_user_id
    and completed_at::date = v_today;

  if v_already_completed > 0 then
    raise exception 'Quest already completed today';
  end if;

  -- Insert completion record
  insert into public.habit_completions (habit_id, user_id, completed_at)
  values (p_habit_id, v_user_id, now());

  -- Get current profile info
  select xp, xp_to_next, level, streak
  into v_current_xp, v_xp_to_next, v_level, v_streak
  from public.profiles
  where id = v_user_id;

  -- Calculate streak
  -- Check total completions today
  select count(*)
  into v_already_completed
  from public.habit_completions
  where user_id = v_user_id
    and completed_at::date = v_today;
  
  -- Increment streak if this is the first completion of the day
  if v_already_completed = 1 then
    v_streak := v_streak + 1;
  end if;

  -- XP Multiplier
  if v_streak >= 3 then
    v_multiplier := 1.25;
  else
    v_multiplier := 1.00;
  end if;

  -- Calculate XP Earned
  v_xp_earned := round(v_xp_reward * v_multiplier);
  v_current_xp := v_current_xp + v_xp_earned;

  -- Check for level up
  if v_current_xp >= v_xp_to_next then
    v_leveled_up := true;
    v_level := v_level + 1;
    v_current_xp := v_current_xp - v_xp_to_next;
    v_xp_to_next := v_level * 100;
  end if;

  -- Update profiles table
  update public.profiles
  set xp = v_current_xp,
      xp_to_next = v_xp_to_next,
      level = v_level,
      streak = v_streak,
      hp = case when v_leveled_up then hp_max else hp end
  where id = v_user_id;

  -- Increment base stat associated with the habit
  if v_stat_category = 'str' then
    update public.stats set str = str + 1 where user_id = v_user_id;
  elsif v_stat_category = 'int' then
    update public.stats set int = int + 1 where user_id = v_user_id;
  elsif v_stat_category = 'wis' then
    update public.stats set wis = wis + 1 where user_id = v_user_id;
  elsif v_stat_category = 'vit' then
    update public.stats set vit = vit + 1 where user_id = v_user_id;
  elsif v_stat_category = 'gold' then
    update public.stats set gold = gold + 1 where user_id = v_user_id;
  elsif v_stat_category = 'cha' then
    update public.stats set cha = cha + 1 where user_id = v_user_id;
  end if;

  -- Reward extra Gold for completion based on difficulty
  update public.stats
  set gold = gold + case 
    when v_difficulty = 'easy' then 1
    when v_difficulty = 'medium' then 3
    when v_difficulty = 'hard' then 5
    else 1
  end
  where user_id = v_user_id;

  return jsonb_build_object(
    'xp_earned', v_xp_earned,
    'leveled_up', v_leveled_up,
    'new_level', v_level,
    'streak', v_streak,
    'multiplier', v_multiplier
  );
end;
$$;

-- 7. Get Today Summary Function
create or replace function public.get_today_summary(p_user_id uuid)
returns json as $$
declare
  v_total_habits integer;
  v_completed_today integer;
  v_total_xp_today integer;
begin
  select count(*) into v_total_habits 
  from public.habits 
  where user_id = p_user_id and is_active = true;
  
  select count(*), coalesce(sum(xp_earned), 0) 
  into v_completed_today, v_total_xp_today
  from public.habit_completions 
  where user_id = p_user_id 
  and completed_at::date = current_date;
  
  return json_build_object(
    'total_habits', v_total_habits,
    'completed_today', v_completed_today,
    'total_xp_today', v_total_xp_today,
    'completion_rate', case when v_total_habits > 0 
      then round((v_completed_today::numeric / v_total_habits) * 100)
      else 0 end
  );
end;
$$ language plpgsql security definer;
