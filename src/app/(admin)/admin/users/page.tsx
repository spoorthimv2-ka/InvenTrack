"use client";

import { Users, Shield, UserCheck } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <p className="text-sm text-slate-400 mt-1">Manage team members and their roles.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Admins</p>
            <p className="text-2xl font-bold text-slate-100">1</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <UserCheck className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Staff</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
            <Users className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-100">—</p>
          </div>
        </div>
      </div>

      <div className="card p-6 text-center text-slate-500 text-sm">
        User list will appear here once you have multiple team members signed up.
      </div>
    </div>
  );
}
