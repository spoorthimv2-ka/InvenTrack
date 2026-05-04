import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/types";

const supabase = createClient();

export async function fetchSuppliers(params?: {
  status?: "active" | "inactive";
  search?: string;
}) {
  let query = supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (params?.status) query = query.eq("status", params.status);
  if (params?.search) query = query.ilike("name", `%${params.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Supplier[];
}

export async function fetchSupplier(id: string) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Supplier;
}

export async function createSupplier(
  payload: Omit<Supplier, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Supplier;
}

export async function updateSupplier(id: string, payload: Partial<Supplier>) {
  const { data, error } = await supabase
    .from("suppliers")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Supplier;
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*, parent:categories(id, name)")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
