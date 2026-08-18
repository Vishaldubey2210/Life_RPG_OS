-- ============================================================
-- Life RPG OS — Day 6 Admin & System Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add admin flag to profiles
alter table public.profiles add column if not exists
  is_admin boolean default false;

-- 2. Add suspended flag to profiles
alter table public.profiles add column if not exists
  is_suspended boolean default false;

-- 3. App Configuration Table
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default config rows
insert into public.app_config (key, value, description) values
  ('maintenance_mode', jsonb_build_object('enabled', false, 'message', ''), 'System maintenance mode'),
  ('announcement', jsonb_build_object('message', '', 'type', 'info', 'link', null, 'linkText', null), 'Global announcement'),
  ('feature_flags', jsonb_build_object(
    'party_system_enabled', true,
    'couple_system_enabled', true,
    'leaderboard_enabled', true,
    'achievements_enabled', true,
    'coaching_enabled', true
  ), 'Feature toggles'),
  ('rate_limits', jsonb_build_object('requests_per_minute', 60, 'burst_limit', 100), 'API rate limiting')
on conflict (key) do nothing;

-- Enable RLS on app_config
alter table public.app_config enable row level security;

create policy "Public read app_config" 
  on public.app_config for select
  using (true);

create policy "Admins can update app_config" 
  on public.app_config for update
  using (
    auth.uid() in (
      select id from public.profiles where is_admin = true
    )
  );


-- 4. Error Logs Table
create table if not exists public.error_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  error_type text not null,
  error_message text,
  stack_trace text,
  url text,
  user_agent text,
  severity text default 'error' check (severity in ('info', 'warning', 'error', 'critical')),
  resolved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index idx_error_logs_created_at on public.error_logs(created_at desc);
create index idx_error_logs_severity on public.error_logs(severity);

-- Enable RLS on error_logs
alter table public.error_logs enable row level security;

create policy "Users can view their own errors" 
  on public.error_logs for select
  using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where is_admin = true));

create policy "Users can insert error logs" 
  on public.error_logs for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Admins can update error logs" 
  on public.error_logs for update
  using (auth.uid() in (select id from public.profiles where is_admin = true));


-- 5. System Metrics Table
create table if not exists public.system_metrics (
  id uuid default gen_random_uuid() primary key,
  metric_type text not null check (metric_type in ('users', 'habits', 'completions', 'errors', 'performance')),
  metric_name text not null,
  metric_value numeric not null,
  unit text,
  recorded_at timestamp with time zone default timezone('utc'::text, now())
);

create index idx_system_metrics_recorded_at on public.system_metrics(recorded_at desc);
create index idx_system_metrics_metric_type on public.system_metrics(metric_type);

-- Enable RLS on system_metrics
alter table public.system_metrics enable row level security;

create policy "Admins can view system metrics" 
  on public.system_metrics for select
  using (auth.uid() in (select id from public.profiles where is_admin = true));

create policy "Service role can insert metrics" 
  on public.system_metrics for insert
  with check (true);


-- 6. Feedback Table
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  feedback_type text not null check (feedback_type in ('bug', 'feature_request', 'general', 'complaint')),
  title text not null,
  body text not null,
  status text default 'open' check (status in ('open', 'reviewing', 'acknowledged', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index idx_feedback_created_at on public.feedback(created_at desc);
create index idx_feedback_status on public.feedback(status);

-- Enable RLS on feedback
alter table public.feedback enable row level security;

create policy "Users can insert feedback" 
  on public.feedback for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can view their own feedback" 
  on public.feedback for select
  using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where is_admin = true));

create policy "Admins can update feedback" 
  on public.feedback for update
  using (auth.uid() in (select id from public.profiles where is_admin = true));


-- 7. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  notification_type text not null check (notification_type in ('achievement', 'streak', 'level_up', 'social', 'admin', 'system')),
  is_read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

create policy "Users can view their own notifications" 
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications" 
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Service role can insert notifications" 
  on public.notifications for insert
  with check (true);


-- 8. Generate Daily Metrics Function
create or replace function public.generate_daily_metrics()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total_users integer;
  v_active_users integer;
  v_total_completions integer;
  v_total_xp_earned integer;
  v_avg_streak numeric;
  v_error_count integer;
begin
  -- Count total users
  select count(*) into v_total_users from public.profiles;
  
  -- Count active users (had completions in last 7 days)
  select count(distinct user_id) into v_active_users
  from public.habit_completions
  where completed_at >= now() - interval '7 days';
  
  -- Count today's completions
  select count(*) into v_total_completions
  from public.habit_completions
  where completed_at::date = current_date;
  
  -- Sum XP from today
  select coalesce(sum(xp_reward), 0) into v_total_xp_earned
  from public.habit_completions hc
  join public.habits h on h.id = hc.habit_id
  where hc.completed_at::date = current_date;
  
  -- Average active streak
  select coalesce(avg(streak), 0) into v_avg_streak
  from public.profiles
  where streak > 0;
  
  -- Error count (last 24 hours)
  select count(*) into v_error_count
  from public.error_logs
  where created_at >= now() - interval '24 hours';
  
  -- Insert metrics
  insert into public.system_metrics (metric_type, metric_name, metric_value, unit)
  values
    ('users', 'total_users', v_total_users, 'count'),
    ('users', 'active_users_7d', v_active_users, 'count'),
    ('habits', 'completions_today', v_total_completions, 'count'),
    ('habits', 'xp_earned_today', v_total_xp_earned, 'xp'),
    ('habits', 'avg_active_streak', v_avg_streak, 'days'),
    ('errors', 'errors_last_24h', v_error_count, 'count');
  
  return jsonb_build_object(
    'total_users', v_total_users,
    'active_users', v_active_users,
    'completions_today', v_total_completions,
    'xp_earned_today', v_total_xp_earned,
    'avg_streak', v_avg_streak,
    'errors_24h', v_error_count
  );
end;
$$ language plpgsql;


-- 9. Trigger to update feedback updated_at
create or replace function public.update_feedback_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_feedback_updated_at
  before update on public.feedback
  for each row
  execute procedure public.update_feedback_updated_at();
