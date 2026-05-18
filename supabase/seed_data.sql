-- ── Add Categories ───────────────────────────────────────────────────────────
insert into public.categories (name, description) values
('Electronics', 'Gadgets, components, and devices'),
('Office Supplies', 'Paper, pens, and furniture'),
('Hardware', 'Tools, fasteners, and materials'),
('Apparel', 'Clothing and protective gear'),
('Food & Bev', 'Perishables and beverages');

-- ── Add Demo Products ───────────────────────────────────────────────────────
-- Electronics
insert into public.products (sku, name, category_id, unit_price, cost_price, stock_quantity, reorder_level)
select 
  'ELEC-' || i,
  case (i % 5)
    when 0 then 'Wireless Mouse'
    when 1 then 'Mechanical Keyboard'
    when 2 then 'USB-C Cable'
    when 3 then 'Monitor Stand'
    else 'External SSD'
  end,
  (select id from public.categories where name = 'Electronics'),
  (i * 10.5) + 15, (i * 8.5) + 10, i * 5, 10
from generate_series(1, 6) i;

-- Office Supplies
insert into public.products (sku, name, category_id, unit_price, cost_price, stock_quantity, reorder_level)
select 
  'OFFC-' || i,
  case (i % 5)
    when 0 then 'A4 Printer Paper'
    when 1 then 'Ergonomic Chair'
    when 2 then 'Blue Ink Pens (10pk)'
    when 3 then 'Whiteboard Markers'
    else 'Desktop Organizer'
  end,
  (select id from public.categories where name = 'Office Supplies'),
  (i * 5.5) + 5, (i * 3.5) + 2, i * 15, 20
from generate_series(1, 6) i;

-- Hardware
insert into public.products (sku, name, category_id, unit_price, cost_price, stock_quantity, reorder_level)
select 
  'HARD-' || i,
  case (i % 5)
    when 0 then 'Power Drill'
    when 1 then 'Socket Wrench Set'
    when 2 then 'Steel Hammer'
    when 3 then 'Measuring Tape'
    else 'Safety Goggles'
  end,
  (select id from public.categories where name = 'Hardware'),
  (i * 15.5) + 25, (i * 10.5) + 15, i * 3, 5
from generate_series(1, 6) i;

-- Apparel
insert into public.products (sku, name, category_id, unit_price, cost_price, stock_quantity, reorder_level)
select 
  'CLOT-' || i,
  case (i % 5)
    when 0 then 'Cotton T-Shirt'
    when 1 then 'Denim Jeans'
    when 2 then 'Canvas Jacket'
    when 3 then 'Running Shoes'
    else 'Baseball Cap'
  end,
  (select id from public.categories where name = 'Apparel'),
  (i * 20.5) + 10, (i * 12.5) + 5, i * 8, 15
from generate_series(1, 7) i;

-- ── Add Suppliers ───────────────────────────────────────────────────────────
insert into public.suppliers (name, contact_name, email, phone, lead_time_days, status) values
('TechSource Global', 'Alice Smith', 'alice@techsource.demo', '+1-555-0101', 14, 'active'),
('Office Depot Pro', 'Bob Johnson', 'bob@officedepot.demo', '+1-555-0202', 3, 'active'),
('Industrial Tools Inc', 'Charlie Brown', 'charlie@industrial.demo', '+1-555-0303', 7, 'active'),
('Apparel Wholesale', 'Diana Prince', 'diana@apparel.demo', '+1-555-0404', 10, 'active');

-- ── Map Products to Suppliers ───────────────────────────────────────────────
-- TechSource -> Electronics
insert into public.product_suppliers (product_id, supplier_id, unit_cost, is_preferred)
select p.id, s.id, p.cost_price, true
from public.products p
join public.suppliers s on s.name = 'TechSource Global'
where p.sku like 'ELEC-%';

-- Office Depot -> Office Supplies
insert into public.product_suppliers (product_id, supplier_id, unit_cost, is_preferred)
select p.id, s.id, p.cost_price, true
from public.products p
join public.suppliers s on s.name = 'Office Depot Pro'
where p.sku like 'OFFC-%';

-- Industrial -> Hardware
insert into public.product_suppliers (product_id, supplier_id, unit_cost, is_preferred)
select p.id, s.id, p.cost_price, true
from public.products p
join public.suppliers s on s.name = 'Industrial Tools Inc'
where p.sku like 'HARD-%';

-- Apparel -> Apparel
insert into public.product_suppliers (product_id, supplier_id, unit_cost, is_preferred)
select p.id, s.id, p.cost_price, true
from public.products p
join public.suppliers s on s.name = 'Apparel Wholesale'
where p.sku like 'CLOT-%';

-- ── Add Demo Orders ─────────────────────────────────────────────────────────
-- Note: We assume the user running this script doesn't have an auth.uid() mapped in the script context, 
-- so created_by will be null.
insert into public.orders (order_number, supplier_id, status, total_amount, expected_date)
select 
  'ORD-DEMO-' || lpad(i::text, 4, '0'),
  (select id from public.suppliers order by random() limit 1),
  case (i % 4)
    when 0 then 'pending'
    when 1 then 'processing'
    when 2 then 'completed'
    else 'cancelled'
  end,
  (i * 150.50) + 100,
  current_date + (i % 10)
from generate_series(1, 12) i;

