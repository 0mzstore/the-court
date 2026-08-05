-- The Court — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` once the CLI is set up.

create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'pro');
create type user_role as enum ('player', 'admin');
create type registration_status as enum
  ('registered', 'waiting_list', 'confirmed', 'checked_in', 'no_show', 'cancelled');
create type match_result as enum ('A', 'B', 'draw');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  phone text,
  gender text check (gender in ('male','female')),
  skill_level skill_level not null default 'beginner',
  role user_role not null default 'player',
  created_at timestamptz not null default now()
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table player_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references profiles(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  points integer not null default 1000,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  matches_played integer not null default 0,
  sessions_attended integer not null default 0,
  points_for integer not null default 0,
  points_against integer not null default 0,
  unique (player_id, season_id)
);
create index idx_leaderboard on player_season_stats (season_id, points desc);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  title text not null,
  session_date date not null,
  status text not null default 'upcoming'
    check (status in ('upcoming','attendance_open','in_progress','completed')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table session_locations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  courts_count integer not null default 1,
  first_match_time time,
  match_minutes integer not null default 25,
  rest_minutes integer not null default 0,
  rounds_count integer not null default 5,
  status text not null default 'attendance' check (status in ('attendance','schedule','completed'))
);

create table session_registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  location_id uuid references session_locations(id),
  player_id uuid not null references profiles(id) on delete cascade,
  status registration_status not null default 'registered',
  registered_at timestamptz not null default now(),
  checked_in_at timestamptz,
  position_in_queue integer,
  confirmation_expires_at timestamptz,
  unique (session_id, player_id)
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references session_locations(id) on delete cascade,
  round_number integer not null,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  court_number integer not null,
  team_a uuid[] not null,
  team_b uuid[] not null,
  score_a integer,
  score_b integer,
  result match_result,
  recorded_by uuid references profiles(id),
  recorded_at timestamptz
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references profiles(id) on delete cascade,
  session_id uuid references sessions(id),
  amount numeric(10,2) not null,
  currency text not null default 'EGP',
  method text,
  status text not null default 'pending' check (status in ('pending','paid','refunded')),
  paid_at timestamptz
);

create table sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  tier text check (tier in ('gold','silver','bronze')),
  website_url text,
  active boolean not null default true
);

create table rewards (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references seasons(id),
  title text not null,
  description text,
  sponsor_id uuid references sponsors(id),
  image_url text,
  awarded_to uuid references profiles(id),
  awarded_at timestamptz
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table cms_content (
  key text primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Points engine: server-authoritative, per Phase 1/2 decision.
-- Fires whenever a match result is written or corrected.
-- ============================================================
create or replace function apply_match_points() returns trigger as $$
declare
  v_season_id uuid;
  v_player uuid;
begin
  select se.id into v_season_id
  from rounds r
  join session_locations sl on sl.id = r.location_id
  join sessions s on s.id = sl.session_id
  join seasons se on se.id = s.season_id
  where r.id = new.round_id;

  -- reverse the old result first if this is a correction
  if old.result is not null then
    foreach v_player in array old.team_a loop
      update player_season_stats set
        points = points - case old.result when 'A' then 25 when 'draw' then 10 else -10 end,
        wins = wins - case when old.result = 'A' then 1 else 0 end,
        draws = draws - case when old.result = 'draw' then 1 else 0 end,
        losses = losses - case when old.result = 'B' then 1 else 0 end,
        matches_played = matches_played - 1
      where player_id = v_player and season_id = v_season_id;
    end loop;
    foreach v_player in array old.team_b loop
      update player_season_stats set
        points = points - case old.result when 'B' then 25 when 'draw' then 10 else -10 end,
        wins = wins - case when old.result = 'B' then 1 else 0 end,
        draws = draws - case when old.result = 'draw' then 1 else 0 end,
        losses = losses - case when old.result = 'A' then 1 else 0 end,
        matches_played = matches_played - 1
      where player_id = v_player and season_id = v_season_id;
    end loop;
  end if;

  if new.result is not null then
    foreach v_player in array new.team_a loop
      insert into player_season_stats (player_id, season_id) values (v_player, v_season_id)
        on conflict (player_id, season_id) do nothing;
      update player_season_stats set
        points = points + case new.result when 'A' then 25 when 'draw' then 10 else -10 end,
        wins = wins + case when new.result = 'A' then 1 else 0 end,
        draws = draws + case when new.result = 'draw' then 1 else 0 end,
        losses = losses + case when new.result = 'B' then 1 else 0 end,
        matches_played = matches_played + 1
      where player_id = v_player and season_id = v_season_id;
    end loop;
    foreach v_player in array new.team_b loop
      insert into player_season_stats (player_id, season_id) values (v_player, v_season_id)
        on conflict (player_id, season_id) do nothing;
      update player_season_stats set
        points = points + case new.result when 'B' then 25 when 'draw' then 10 else -10 end,
        wins = wins + case when new.result = 'B' then 1 else 0 end,
        draws = draws + case when new.result = 'draw' then 1 else 0 end,
        losses = losses + case when new.result = 'A' then 1 else 0 end,
        matches_played = matches_played + 1
      where player_id = v_player and season_id = v_season_id;
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_apply_match_points
  after insert or update of result on matches
  for each row execute function apply_match_points();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table player_season_stats enable row level security;
alter table sessions enable row level security;
alter table session_locations enable row level security;
alter table session_registrations enable row level security;
alter table matches enable row level security;
alter table payments enable row level security;
alter table seasons enable row level security;

create policy "profiles are publicly readable" on profiles for select using (true);
create policy "players can update their own profile" on profiles for update using (auth.uid() = id);

create policy "leaderboard is publicly readable" on player_season_stats for select using (true);
create policy "seasons are publicly readable" on seasons for select using (true);
create policy "sessions are publicly readable" on sessions for select using (true);
create policy "locations are publicly readable" on session_locations for select using (true);
create policy "matches are publicly readable" on matches for select using (true);

create policy "players see their own registrations" on session_registrations
  for select using (auth.uid() = player_id or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));
create policy "players manage their own registrations" on session_registrations
  for insert with check (auth.uid() = player_id);
create policy "players cancel their own registrations" on session_registrations
  for update using (auth.uid() = player_id);

create policy "players see their own payments" on payments
  for select using (auth.uid() = player_id or exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Admin-only writes for the core competition data
create policy "admins manage seasons" on seasons for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "admins manage sessions" on sessions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "admins manage matches" on matches for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
