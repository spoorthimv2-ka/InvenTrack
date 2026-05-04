-- ═══════════════════════════════════════════════════════════════════════════
-- InvenTrack — RLS Policies & Auth Helpers
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. Update profiles role constraint to admin | staff ───────────────────
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'staff'));

-- Update default to 'staff' for new signups
alter table public.profiles
  alter column role set default 'staff';


-- ── 1. Helper: get_my_role() ──────────────────────────────────────────────
-- Returns the current authenticated user's role from profiles.
-- Use in RLS policies to avoid repeated subqueries.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

-- Grant execute to authenticated users
grant execute on function public.get_my_role() to authenticated;


-- ── 2. Helper: is_admin() ─────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_role() = 'admin', false);
$$;

grant execute on function public.is_admin() to authenticated;


-- ── 3. Updated profile trigger (admin/staff roles) ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  -- First user ever → promote to admin automatically
  select case when count(*) = 0 then 'admin' else 'staff' end
  into v_role
  from public.profiles;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', v_role)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Re-create trigger (drop first to avoid duplicate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. PROFILES — RLS
-- ═══════════════════════════════════════════════════════════════════════════
-- Drop existing policies first to avoid conflicts
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_admin_all"   on public.profiles;

-- Users can always read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin can read all profiles
create policy "profiles_admin_select_all"
  on public.profiles for select
  using (public.is_admin());

-- Users can update their own non-role fields
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    -- Staff cannot escalate their own role
    (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

-- Only admin can update any profile (including role changes)
create policy "profiles_admin_update_all"
  on public.profiles for update
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 5. PRODUCTS — read all authenticated, write admin only
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists "products_read_auth"  on public.products;
drop policy if exists "products_write_mgr"  on public.products;

-- Any authenticated user can read products
create policy "products_select_all_auth"
  on public.products for select
  using (auth.role() = 'authenticated');

-- Only admin can insert / update / delete products
create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ORDERS — staff sees own orders, admin sees all
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists "orders_read_auth" on public.orders;
drop policy if exists "orders_write_mgr" on public.orders;

-- Staff: select only orders they created
create policy "orders_select_staff_own"
  on public.orders for select
  using (
    auth.uid() = created_by
    or public.is_admin()
  );

-- Staff: insert their own orders
create policy "orders_insert_staff"
  on public.orders for insert
  with check (
    auth.uid() = created_by
    or public.is_admin()
  );

-- Staff: update only their own pending/processing orders
create policy "orders_update_staff_own"
  on public.orders for update
  using (
    (auth.uid() = created_by and status in ('pending', 'processing'))
    or public.is_admin()
  );

-- Only admin can delete orders
create policy "orders_delete_admin"
  on public.orders for delete
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 7. ORDER ITEMS — tied to orders (inherit visibility from orders)
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists "order_items_read_auth"  on public.order_items;
drop policy if exists "order_items_write_mgr"  on public.order_items;

-- Select: visible if the parent order is visible to the user
create policy "order_items_select"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.created_by = auth.uid() or public.is_admin())
    )
  );

-- Insert: user must own the parent order
create policy "order_items_insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.created_by = auth.uid() or public.is_admin())
        and o.status in ('pending')           -- can only add items to pending orders
    )
  );

-- Update: admin only
create policy "order_items_update_admin"
  on public.order_items for update
  using (public.is_admin());

-- Delete: admin only
create policy "order_items_delete_admin"
  on public.order_items for delete
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 8. TRANSACTION HISTORY — admin read only
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists "txn_read_auth"  on public.transaction_history;
drop policy if exists "txn_insert_mgr" on public.transaction_history;

-- Only admin can read transaction logs
create policy "txn_select_admin"
  on public.transaction_history for select
  using (public.is_admin());

-- Inserts happen via triggers (security definer), so no policy needed for users.
-- Explicitly deny direct inserts by staff for safety:
create policy "txn_insert_deny_staff"
  on public.transaction_history for insert
  with check (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 9. AUDIT LOGS — admin read only (no direct writes by users)
-- ═══════════════════════════════════════════════════════════════════════════
drop policy if exists "audit_admin_only" on public.audit_logs;

create policy "audit_select_admin"
  on public.audit_logs for select
  using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════════
-- 10. SUPPLIERS, CATEGORIES, PRODUCT_SUPPLIERS, BATCH_TRACKING — admin write
-- ═══════════════════════════════════════════════════════════════════════════

-- Suppliers
drop policy if exists "suppliers_read_auth" on public.suppliers;
drop policy if exists "suppliers_write_mgr" on public.suppliers;
create policy "suppliers_select_auth"   on public.suppliers for select using (auth.role() = 'authenticated');
create policy "suppliers_insert_admin"  on public.suppliers for insert with check (public.is_admin());
create policy "suppliers_update_admin"  on public.suppliers for update using (public.is_admin());
create policy "suppliers_delete_admin"  on public.suppliers for delete using (public.is_admin());

-- Categories
drop policy if exists "categories_read_auth" on public.categories;
drop policy if exists "categories_write_mgr" on public.categories;
create policy "categories_select_auth"  on public.categories for select using (auth.role() = 'authenticated');
create policy "categories_write_admin"  on public.categories for all   using (public.is_admin());

-- Product Suppliers
drop policy if exists "product_suppliers_read"  on public.product_suppliers;
drop policy if exists "product_suppliers_write" on public.product_suppliers;
create policy "product_suppliers_select" on public.product_suppliers for select using (auth.role() = 'authenticated');
create policy "product_suppliers_write"  on public.product_suppliers for all   using (public.is_admin());

-- Batch Tracking
drop policy if exists "batch_read_auth" on public.batch_tracking;
drop policy if exists "batch_write_mgr" on public.batch_tracking;
create policy "batch_select_auth"  on public.batch_tracking for select using (auth.role() = 'authenticated');
create policy "batch_write_admin"  on public.batch_tracking for all   using (public.is_admin());
