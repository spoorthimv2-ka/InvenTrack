import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types";

const supabase = createClient();

// Valid state transitions mirroring the DB trigger
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ["processing", "cancelled"],
  processing: ["completed",  "cancelled"],
  completed:  [],
  cancelled:  [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export async function fetchOrders(params: {
  status?: string;
  supplierId?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const {
    status = "",
    supplierId = "",
    sortColumn = "created_at",
    sortDirection = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  let query = supabase
    .from("orders")
    .select(
      "*, supplier:suppliers(*), creator:profiles(*), items:order_items(*, product:products(*))",
      { count: "exact" }
    )
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status)     query = query.eq("status", status);
  if (supplierId) query = query.eq("supplier_id", supplierId);

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: (data ?? []) as Order[], total: count ?? 0 };
}

export async function fetchOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, supplier:suppliers(*), creator:profiles(*), items:order_items(*, product:products(*))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Order;
}

export async function createOrder(
  payload: Omit<Order, "id" | "created_at" | "updated_at" | "supplier" | "creator" | "items" | "total_amount">
) {
  const { data, error } = await supabase
    .from("orders")
    .insert({ ...payload, total_amount: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}
