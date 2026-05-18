-- ═══════════════════════════════════════════════════════════════════════════
-- InvenTrack — Settings Schema Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. App-wide key-value settings (admin managed) ───────────────────────────
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Anyone can read app settings
create policy "app_settings_select_all" on public.app_settings
  for select using (true);

-- Only admins can write
create policy "app_settings_admin_write" on public.app_settings
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed default app settings
insert into public.app_settings (key, value, description) values
  ('company_name',        '"InvenTrack"',                   'Company display name'),
  ('company_logo_url',    'null',                           'URL to company logo'),
  ('base_currency',       '"USD"',                          'Base currency code (ISO 4217)'),
  ('tax_rate',            '0',                              'Default tax rate (%)'),
  ('timezone',            '"UTC"',                          'System timezone'),
  ('date_format',         '"MMM dd, yyyy"',                 'Display date format'),
  ('low_stock_threshold', '10',                             'Default reorder level'),
  ('sku_prefix',          '"SKU-"',                         'SKU auto-generation prefix'),
  ('auto_reorder',        'false',                          'Auto-reorder when stock is low'),
  ('default_lead_days',   '7',                              'Default supplier lead time (days)'),
  ('auto_confirm_orders', 'false',                          'Auto-confirm new orders'),
  ('environment',         '"production"',                   'App environment flag')
on conflict (key) do nothing;

-- ── 2. Per-user preferences ───────────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  theme                   text not null default 'dark' check (theme in ('light', 'dark', 'system')),
  language                text not null default 'en',
  timezone                text not null default 'UTC',
  date_format             text not null default 'MMM dd, yyyy',
  number_format           text not null default 'en-US',
  -- Notification toggles
  notify_email            boolean not null default true,
  notify_low_stock        boolean not null default true,
  notify_order_updates    boolean not null default true,
  notify_system_alerts    boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "prefs_own" on public.user_preferences
  for all using (auth.uid() = user_id);

-- Auto-create preferences row on new user
create or replace function public.handle_new_user_prefs()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created_prefs
  after insert on auth.users
  for each row execute procedure public.handle_new_user_prefs();

-- ── 3. Add missing columns to profiles if not already present ────────────────
alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists last_login_at timestamptz;

-- Update last_login_at on sign-in (via auth hook) — set manually for now
-- You can hook this from AuthProvider on the client side.
