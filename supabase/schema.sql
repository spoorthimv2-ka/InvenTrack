-- ═══════════════════════════════════════════════════════════════════════════
-- InvenTrack — Comprehensive PostgreSQL Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════════════════════════════════════
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text not null,
  role        text not null default 'viewer'
              check (role in ('admin', 'manager', 'viewer')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);

alter table public.profiles enable row level security;

create policy "profiles_select_own"  on public.profiles for select  using (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update  using (auth.uid() = id);
create policy "profiles_admin_all"   on public.profiles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CATEGORIES  (self-referencing for nested categories)
-- ═══════════════════════════════════════════════════════════════════════════
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  parent_id   uuid references public.categories(id) on delete set null,
  created_at  timestamptz not null default now()
);

create unique index idx_categories_name_parent
  on public.categories(name, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index idx_categories_parent on public.categories(parent_id);

alter table public.categories enable row level security;
create policy "categories_read_auth" on public.categories for select using (auth.role() = 'authenticated');
create policy "categories_write_mgr" on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. SUPPLIERS
-- ═══════════════════════════════════════════════════════════════════════════
create table public.suppliers (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  contact_name   text,
  email          text,
  phone          text,
  address        text,
  website        text,
  lead_time_days integer not null default 7 check (lead_time_days >= 0),
  status         text not null default 'active' check (status in ('active','inactive')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_suppliers_status on public.suppliers(status);
create index idx_suppliers_name   on public.suppliers(name);

alter table public.suppliers enable row level security;
create policy "suppliers_read_auth" on public.suppliers for select using (auth.role() = 'authenticated');
create policy "suppliers_write_mgr" on public.suppliers for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  sku             text not null unique,
  name            text not null,
  description     text,
  category_id     uuid references public.categories(id) on delete set null,
  unit_price      numeric(12,2) not null default 0 check (unit_price >= 0),
  cost_price      numeric(12,2) not null default 0 check (cost_price >= 0),
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  reorder_level   integer not null default 5  check (reorder_level >= 0),
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_sku         on public.products(sku);
create index idx_products_category    on public.products(category_id);
create index idx_products_is_active   on public.products(is_active);
create index idx_products_stock       on public.products(stock_quantity);
create index idx_products_name_trgm   on public.products using gin (name gin_trgm_ops);  -- optional: requires pg_trgm

alter table public.products enable row level security;
create policy "products_read_auth" on public.products for select using (auth.role() = 'authenticated');
create policy "products_write_mgr" on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. PRODUCT ↔ SUPPLIER  (many-to-many with costing)
-- ═══════════════════════════════════════════════════════════════════════════
create table public.product_suppliers (
  product_id   uuid not null references public.products(id)  on delete cascade,
  supplier_id  uuid not null references public.suppliers(id) on delete cascade,
  unit_cost    numeric(12,2) not null default 0 check (unit_cost >= 0),
  is_preferred boolean not null default false,
  created_at   timestamptz not null default now(),
  primary key (product_id, supplier_id)
);

create index idx_product_suppliers_supplier on public.product_suppliers(supplier_id);

-- Enforce only one preferred supplier per product
create unique index idx_product_one_preferred
  on public.product_suppliers(product_id)
  where is_preferred = true;

alter table public.product_suppliers enable row level security;
create policy "product_suppliers_read" on public.product_suppliers for select using (auth.role() = 'authenticated');
create policy "product_suppliers_write" on public.product_suppliers for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ORDERS
-- ═══════════════════════════════════════════════════════════════════════════
create table public.orders (
  id            uuid primary key default uuid_generate_v4(),
  order_number  text not null unique,
  created_by    uuid references public.profiles(id) on delete set null,
  supplier_id   uuid references public.suppliers(id) on delete set null,
  status        text not null default 'pending'
                check (status in ('pending','processing','completed','cancelled')),
  total_amount  numeric(14,2) not null default 0 check (total_amount >= 0),
  notes         text,
  expected_date date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_orders_status      on public.orders(status);
create index idx_orders_supplier    on public.orders(supplier_id);
create index idx_orders_created_by  on public.orders(created_by);
create index idx_orders_created_at  on public.orders(created_at desc);

alter table public.orders enable row level security;
create policy "orders_read_auth" on public.orders for select using (auth.role() = 'authenticated');
create policy "orders_write_mgr" on public.orders for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

-- ── Order State-Transition Enforcement ──────────────────────────────────────
-- Allowed transitions:
--   pending     → processing | cancelled
--   processing  → completed  | cancelled
--   completed   → (terminal)
--   cancelled   → (terminal)
create or replace function public.enforce_order_transition()
returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;

  if old.status = 'completed' or old.status = 'cancelled' then
    raise exception 'Order % is in terminal state "%" and cannot be changed.',
      old.order_number, old.status;
  end if;

  if old.status = 'pending' and new.status not in ('processing','cancelled') then
    raise exception 'Invalid transition: pending → %. Allowed: processing, cancelled.', new.status;
  end if;

  if old.status = 'processing' and new.status not in ('completed','cancelled') then
    raise exception 'Invalid transition: processing → %. Allowed: completed, cancelled.', new.status;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger order_status_guard
  before update of status on public.orders
  for each row execute procedure public.enforce_order_transition();


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ORDER ITEMS
-- ═══════════════════════════════════════════════════════════════════════════
create table public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(14,2) generated always as (quantity * unit_price) stored,
  created_at  timestamptz not null default now()
);

create index idx_order_items_order   on public.order_items(order_id);
create index idx_order_items_product on public.order_items(product_id);

alter table public.order_items enable row level security;
create policy "order_items_read_auth" on public.order_items for select using (auth.role() = 'authenticated');
create policy "order_items_write_mgr" on public.order_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

-- Recalculate order total when items change
create or replace function public.sync_order_total()
returns trigger language plpgsql as $$
declare v_order_id uuid;
begin
  v_order_id := coalesce(new.order_id, old.order_id);
  update public.orders
    set total_amount = (
      select coalesce(sum(total_price), 0)
      from public.order_items
      where order_id = v_order_id
    ),
    updated_at = now()
  where id = v_order_id;
  return coalesce(new, old);
end;
$$;

create trigger order_total_sync
  after insert or update or delete on public.order_items
  for each row execute procedure public.sync_order_total();


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. TRANSACTION HISTORY  (stock movement log)
-- ═══════════════════════════════════════════════════════════════════════════
create type public.stock_change_type as enum (
  'purchase', 'sale', 'adjustment', 'return', 'write_off', 'transfer'
);

create table public.transaction_history (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references public.products(id) on delete cascade,
  change_type     public.stock_change_type not null,
  quantity_delta  integer not null,               -- positive = stock in, negative = stock out
  stock_before    integer not null check (stock_before >= 0),
  stock_after     integer not null check (stock_after  >= 0),
  reference_id    uuid,                           -- optional: order_id etc.
  notes           text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index idx_txn_product    on public.transaction_history(product_id, created_at desc);
create index idx_txn_type       on public.transaction_history(change_type);
create index idx_txn_created_at on public.transaction_history(created_at desc);

alter table public.transaction_history enable row level security;
create policy "txn_read_auth"  on public.transaction_history for select using (auth.role() = 'authenticated');
create policy "txn_insert_mgr" on public.transaction_history for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));

-- Auto-log stock changes on products.stock_quantity update
create or replace function public.log_stock_transaction()
returns trigger language plpgsql security definer as $$
begin
  if old.stock_quantity <> new.stock_quantity then
    insert into public.transaction_history
      (product_id, change_type, quantity_delta, stock_before, stock_after, created_by)
    values (
      new.id,
      'adjustment',
      new.stock_quantity - old.stock_quantity,
      old.stock_quantity,
      new.stock_quantity,
      auth.uid()
    );
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger product_stock_log
  before update of stock_quantity on public.products
  for each row execute procedure public.log_stock_transaction();


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. AUDIT LOGS  (generic change tracking for any table)
-- ═══════════════════════════════════════════════════════════════════════════
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  table_name  text not null,
  operation   text not null check (operation in ('INSERT','UPDATE','DELETE')),
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_by  uuid references public.profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);

create index idx_audit_table      on public.audit_logs(table_name, changed_at desc);
create index idx_audit_record     on public.audit_logs(record_id);
create index idx_audit_changed_by on public.audit_logs(changed_by);
create index idx_audit_changed_at on public.audit_logs(changed_at desc);

alter table public.audit_logs enable row level security;
create policy "audit_admin_only" on public.audit_logs for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Generic audit trigger function (attach to any table)
create or replace function public.audit_trigger_fn()
returns trigger language plpgsql security definer as $$
declare
  v_old  jsonb := null;
  v_new  jsonb := null;
  v_id   uuid  := null;
begin
  if tg_op = 'DELETE' then
    v_old := to_jsonb(old);
    v_id  := (old).id;
  elsif tg_op = 'INSERT' then
    v_new := to_jsonb(new);
    v_id  := (new).id;
  else  -- UPDATE
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    v_id  := (new).id;
  end if;

  insert into public.audit_logs (table_name, operation, record_id, old_data, new_data, changed_by)
  values (tg_table_name, tg_op, v_id, v_old, v_new, auth.uid());

  return coalesce(new, old);
end;
$$;

-- Attach audit trigger to core tables
create trigger audit_products
  after insert or update or delete on public.products
  for each row execute procedure public.audit_trigger_fn();

create trigger audit_orders
  after insert or update or delete on public.orders
  for each row execute procedure public.audit_trigger_fn();

create trigger audit_suppliers
  after insert or update or delete on public.suppliers
  for each row execute procedure public.audit_trigger_fn();


-- ═══════════════════════════════════════════════════════════════════════════
-- 10. BATCH TRACKING  (expiry / lot control)
-- ═══════════════════════════════════════════════════════════════════════════
create table public.batch_tracking (
  id               uuid primary key default uuid_generate_v4(),
  product_id       uuid not null references public.products(id) on delete cascade,
  batch_number     text not null,
  manufacture_date date,
  expiry_date      date,
  quantity         integer not null check (quantity >= 0),
  supplier_id      uuid references public.suppliers(id) on delete set null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (product_id, batch_number)
);

create index idx_batch_product    on public.batch_tracking(product_id);
create index idx_batch_expiry     on public.batch_tracking(expiry_date);
create index idx_batch_number     on public.batch_tracking(batch_number);

alter table public.batch_tracking enable row level security;
create policy "batch_read_auth"  on public.batch_tracking for select using (auth.role() = 'authenticated');
create policy "batch_write_mgr"  on public.batch_tracking for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','manager')));


-- ═══════════════════════════════════════════════════════════════════════════
-- REALTIME  — enable for live dashboard updates
-- ═══════════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.transaction_history;
alter publication supabase_realtime add table public.batch_tracking;
