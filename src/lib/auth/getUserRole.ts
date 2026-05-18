import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "staff";

/**
 * Server-side helper: fetches the session and role from Supabase.
 * Call from Server Components and layouts.
 */
export async function getUserRole(): Promise<{ userId: string; role: UserRole }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "staff") as UserRole;
  return { userId: user.id, role };
}

/**
 * Require admin role. Redirects to /staff/inventory if user is not admin.
 */
export async function requireAdmin() {
  const { role } = await getUserRole();
  if (role !== "admin") redirect("/staff/inventory");
  return { role };
}

/**
 * Require staff or admin role. Redirects to /login if unauthenticated.
 */
export async function requireAuth() {
  return await getUserRole();
}
