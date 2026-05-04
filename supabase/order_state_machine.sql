-- ═══════════════════════════════════════════════════════════════════════════
-- InvenTrack — Order State Machine & Stock Reservation
-- Run AFTER schema.sql and rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- We will replace the existing transition enforcer to also handle stock updates.
drop trigger if exists order_transition_guard on public.orders;
drop function if exists public.enforce_order_transition_fn;

create or replace function public.order_state_machine_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  -- 1. State Machine Validation
  if new.status = old.status then
    return new;
  end if;

  -- pending -> processing OR cancelled
  if old.status = 'pending' and new.status not in ('processing', 'cancelled') then
    raise exception 'Invalid transition: % to %', old.status, new.status;
  end if;

  -- processing -> completed OR cancelled
  if old.status = 'processing' and new.status not in ('completed', 'cancelled') then
    raise exception 'Invalid transition: % to %', old.status, new.status;
  end if;

  -- completed / cancelled are terminal
  if old.status in ('completed', 'cancelled') then
    raise exception 'Order is in a terminal state (%) and cannot be changed.', old.status;
  end if;

  -- 2. Stock Modification Logic (Reserved Stock)
  
  -- When moving to processing, we deduct/reserve stock.
  -- (Assuming these orders represent outbound fulfillment where stock is reserved)
  if old.status = 'pending' and new.status = 'processing' then
    for item in (select product_id, quantity from public.order_items where order_id = new.id) loop
      -- Will automatically fire log_stock_transaction to create transaction_history
      update public.products
      set stock_quantity = stock_quantity - item.quantity
      where id = item.product_id;
    end loop;
  end if;

  -- When cancelled from processing, we restore the reserved stock.
  if old.status = 'processing' and new.status = 'cancelled' then
    for item in (select product_id, quantity from public.order_items where order_id = new.id) loop
      -- Will automatically fire log_stock_transaction to create transaction_history
      update public.products
      set stock_quantity = stock_quantity + item.quantity
      where id = item.product_id;
    end loop;
  end if;

  return new;
end;
$$;

create trigger order_state_machine_trigger
  before update on public.orders
  for each row execute procedure public.order_state_machine_fn();
