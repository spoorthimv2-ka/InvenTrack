# InvenTrack

A production-ready, fullstack **Inventory Management System** built with Next.js 14, Supabase, Tailwind CSS, and Zustand.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript      |
| Styling     | Tailwind CSS (custom dark design system) |
| Auth        | Supabase Auth + RLS                      |
| Database    | Supabase PostgreSQL                      |
| Realtime    | Supabase Realtime                        |
| State       | Zustand (with persist middleware)        |
| Charts      | Recharts                                 |

---

## Folder Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated shell (Sidebar + Header)
│   │   ├── layout.tsx
│   │   ├── inventory/        # /inventory
│   │   ├── orders/           # /orders
│   │   ├── suppliers/        # /suppliers
│   │   └── reports/          # /reports
│   ├── login/                # /login
│   ├── layout.tsx            # Root layout (AuthProvider)
│   └── globals.css
├── components/
│   ├── layout/               # Sidebar, Header
│   ├── providers/            # AuthProvider
│   └── ui/                   # StatCard, Modal, StatusBadge, Loader
├── lib/
│   ├── api/                  # inventory.ts, orders.ts, suppliers.ts
│   ├── supabase/             # client.ts, server.ts, middleware.ts
│   ├── auth.ts               # Server-side auth helpers
│   └── utils.ts
├── store/                    # Zustand stores
│   ├── auth.store.ts
│   ├── inventory.store.ts
│   └── orders.store.ts
├── types/
│   └── index.ts              # All TypeScript types
└── middleware.ts              # Auth session refresh

supabase/
├── schema.sql                # Full DB schema (run first)
└── rls_policies.sql          # RLS policies + auth helpers (run second)
```

---

## Database Schema

10 tables with full constraints, indexes, and triggers:

| Table                | Purpose                                    |
|----------------------|--------------------------------------------|
| `profiles`           | Extends `auth.users` with role (`admin`/`staff`) |
| `categories`         | Nested categories (self-referencing `parent_id`) |
| `products`           | SKU-unique products with stock tracking    |
| `suppliers`          | Supplier directory with `lead_time_days`   |
| `product_suppliers`  | Many-to-many with preferred supplier flag  |
| `orders`             | Purchase orders with state machine         |
| `order_items`        | Line items (auto-total via trigger)        |
| `transaction_history`| Stock movement audit trail                 |
| `audit_logs`         | Generic change tracking for all tables     |
| `batch_tracking`     | Lot/expiry control per product             |

---

## Roles & RLS

| Role    | Products          | Orders                          | Transaction History |
|---------|-------------------|---------------------------------|---------------------|
| `admin` | Read + Write      | Read all + Write all            | Read                |
| `staff` | Read only         | Read/write **own** orders only  | ❌ No access        |

**First registered user is auto-promoted to `admin`.**

---

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL + anon key
```

### 3. Set up the database

In **Supabase Dashboard → SQL Editor**, run in order:
1. `supabase/schema.sql`
2. `supabase/rls_policies.sql`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/inventory` after login.

---

## Environment Variables

| Variable                         | Description               |
|----------------------------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY`      | Service role key (server) |
