import { createClient } from "@/lib/supabase/client";
import type { UserPreferences, Profile } from "@/types";

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "avatar_url">>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Current password is incorrect" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

// ── User Preferences ─────────────────────────────────────────────────────────

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

export async function upsertUserPreferences(
  userId: string,
  prefs: Partial<Omit<UserPreferences, "user_id" | "created_at" | "updated_at">>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
  return { error: error?.message ?? null };
}

// ── App Settings (admin only) ─────────────────────────────────────────────────

export async function getAppSettings(): Promise<Record<string, unknown>> {
  const supabase = createClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  if (!data) return {};
  return Object.fromEntries(data.map((row: { key: string; value: unknown }) => [row.key, row.value]));
}

export async function updateAppSetting(
  key: string,
  value: unknown
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_by: user?.id, updated_at: new Date().toISOString() });
  return { error: error?.message ?? null };
}

export async function updateAppSettings(
  settings: Record<string, unknown>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_by: user?.id,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("app_settings").upsert(rows);
  return { error: error?.message ?? null };
}

// ── Admin: User Management ────────────────────────────────────────────────────

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "staff"
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function toggleUserActive(
  userId: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

// ── Audit Logs (admin only) ───────────────────────────────────────────────────

export async function getAuditLogs(limit = 100) {
  const supabase = createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
