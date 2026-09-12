-- Speak Like a Native: Supabase database setup
-- Run this once in Supabase Dashboard -> SQL Editor.
-- After it succeeds, replace the bootstrap email below with your own, then run it.

create table if not exists public.authorized_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'),
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text not null,
  request_type text not null check (request_type in ('transcription', 'coaching')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cached_input_tokens integer,
  audio_seconds numeric,
  estimated_cost_usd numeric,
  latency_ms integer,
  status text not null check (status in ('succeeded', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_created_at_idx on public.usage_events (created_at desc);
create index if not exists usage_events_user_email_idx on public.usage_events (user_email);

-- The browser never reads or writes these tables. The server uses the service-role key.
alter table public.authorized_emails enable row level security;
alter table public.usage_events enable row level security;
revoke all on public.authorized_emails from anon, authenticated;
revoke all on public.usage_events from anon, authenticated;

-- Bootstrap the first administrator before attempting to sign in.
-- Replace admin@example.com, remove the leading comment marker, and run this statement:
-- insert into public.authorized_emails (email, role) values ('admin@example.com', 'admin');
