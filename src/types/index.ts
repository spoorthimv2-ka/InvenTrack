// ─── Auth / Profiles ───────────────────────────────────────────────────────

export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Categories ────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  // Joined
  parent?: Category;
  children?: Category[];
}

// ─── Suppliers ─────────────────────────────────────────────────────────────

export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  lead_time_days: number;
  status: SupplierStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Products ──────────────────────────────────────────────────────────────

export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  // Derived (computed client-side)
  status?: ProductStatus;
}

// ─── Product ↔ Supplier junction ──────────────────────────────────────────

export interface ProductSupplier {
  product_id: string;
  supplier_id: string;
  unit_cost: number;
  is_preferred: boolean;
  created_at: string;
  // Joined
  supplier?: Supplier;
  product?: Product;
}

// ─── Orders ────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Order {
  id: string;
  order_number: string;
  created_by: string | null;
  supplier_id: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  expected_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  supplier?: Supplier;
  creator?: Profile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  // Joined
  product?: Product;
}

// ─── Transaction History ───────────────────────────────────────────────────

export type StockChangeType =
  | "purchase"
  | "sale"
  | "adjustment"
  | "return"
  | "write_off"
  | "transfer";

export interface TransactionHistory {
  id: string;
  product_id: string;
  change_type: StockChangeType;
  quantity_delta: number;
  stock_before: number;
  stock_after: number;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Joined
  product?: Product;
  creator?: Profile;
}

// ─── Audit Logs ────────────────────────────────────────────────────────────

export type AuditOperation = "INSERT" | "UPDATE" | "DELETE";

export interface AuditLog {
  id: string;
  table_name: string;
  operation: AuditOperation;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
}

// ─── Batch Tracking ────────────────────────────────────────────────────────

export interface BatchTracking {
  id: string;
  product_id: string;
  batch_number: string;
  manufacture_date: string | null;
  expiry_date: string | null;
  quantity: number;
  supplier_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  product?: Product;
  supplier?: Supplier;
}

// ─── UI / Utility Types ────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalSuppliers: number;
  inventoryValue: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export type SortDirection = "asc" | "desc";

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ─── Helper: derive product status from stock_quantity ─────────────────────

export function deriveProductStatus(p: Pick<Product, "stock_quantity" | "reorder_level">): ProductStatus {
  if (p.stock_quantity === 0) return "out_of_stock";
  if (p.stock_quantity <= p.reorder_level) return "low_stock";
  return "in_stock";
}
