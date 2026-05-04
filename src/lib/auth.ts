import { createClient } from "@/lib/supabase/server";
import { redirect }     from "next/navigation";
import type { Profile, UserRole } from "@/types";

/**
 * Returns the authenticated user's profile from the database.
 * Redirects to /login if there is no active session.
 */
export async function getAuthenticatedUser(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) redirect("/login");

  return profile as Profile;
}

/**
 * Returns the current user's role, or null if unauthenticated.
 * Safe to call from Server Components.
 */
export async function getMyRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (data?.role as UserRole) ?? null;
}

/**
 * Gate a Server Component or Route Handler to admin-only access.
 * Redirects to /inventory (403 equivalent) if the user is not an admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getAuthenticatedUser();
  if (profile.role !== "admin") redirect("/inventory");
  return profile;
}

/**
 * Gate access to admin or staff.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(): Promise<Profile> {
  return getAuthenticatedUser();
}
