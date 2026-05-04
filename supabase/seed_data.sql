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
