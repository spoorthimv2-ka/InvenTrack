"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllProfiles, updateUserRole, toggleUserActive } from "@/lib/api/settings";
import { SettingsSection, Toast } from "@/components/settings/SettingsUI";
import { Users, UserX, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllProfiles();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRoleChange(userId: string, role: "admin" | "staff") {
    const { error } = await updateUserRole(userId, role);
    if (error) showToast(error, "error");
    else { showToast("Role updated!", "success"); load(); }
  }

  async function handleToggleActive(userId: string, current: boolean) {
    const { error } = await toggleUserActive(userId, !current);
    if (error) showToast(error, "error");
    else { showToast(`User ${!current ? "activated" : "deactivated"}.`, "success"); load(); }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-400" /> User Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage team members, roles, and access.</p>
      </div>

      <SettingsSection title={`All Users (${users.length})`} description="Manage roles and activation status.">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-brand-400" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">User</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Role</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Status</th>
                  <th className="py-2 pr-4 text-left text-xs font-semibold text-slate-400">Joined</th>
                  <th className="py-2 text-right text-xs font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600/30 text-xs font-bold text-brand-300">
                          {u.full_name?.[0]?.toUpperCase() ?? u.email[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{u.full_name ?? "—"}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as "admin" | "staff")}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge-${u.is_active ? "green" : "gray"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        title={u.is_active ? "Deactivate" : "Activate"}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                      >
                        {u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
