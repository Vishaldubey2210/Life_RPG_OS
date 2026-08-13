-- Day 5: Referral system & Push notification schema updates
alter table public.profiles add column if not exists
  referral_code text unique default substr(md5(random()::text), 1, 8);
alter table public.profiles add column if not exists
  referred_by uuid references public.profiles(id);
alter table public.profiles add column if not exists
  referral_count integer default 0;
alter table public.profiles add column if not exists
  referral_xp_earned integer default 0;
alter table public.profiles add column if not exists
  push_subscription jsonb;
