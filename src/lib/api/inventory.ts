import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import { deriveProductStatus } from "@/types";

const supabase = createClient();

export async function fetchProducts(params: {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  const {
    search = "",
    categoryId = "",
    isActive,
    sortColumn = "created_at",
    sortDirection = "desc",
    page = 1,
    pageSize = 20,
  } = params;

  let query = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search)      query = query.ilike("name", `%${search}%`);
  if (categoryId)  query = query.eq("category_id", categoryId);
  if (isActive !== undefined) query = query.eq("is_active", isActive);

  const { data, error, count } = await query;
  if (error) throw error;

  const products = (data ?? []).map((p) => ({
    ...p,
    status: deriveProductStatus(p),
  })) as Product[];

  return { products, total: count ?? 0 };
}

export async function fetchProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return { ...data, status: deriveProductStatus(data) } as Product;
}

export async function createProduct(
  payload: Omit<Product, "id" | "created_at" | "updated_at" | "category" | "status">
) {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return { ...data, status: deriveProductStatus(data) } as Product;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { ...data, status: deriveProductStatus(data) } as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchLowStockProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .filter("stock_quantity", "lte", "reorder_level")
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true });
  if (error) throw error;
  return ((data ?? []).map((p) => ({ ...p, status: deriveProductStatus(p) }))) as Product[];
}
