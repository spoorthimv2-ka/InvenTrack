"use client";

import { SettingsSection } from "@/components/settings/SettingsUI";
import { Shield, ShieldCheck, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RolesSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" /> Roles & Permissions
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review the access levels for your team.</p>
      </div>

      <SettingsSection title="Administrator" description="Full system access">
        <div className="flex items-start gap-4 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-200">Admins have complete access to the application.</p>
            <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
              <li>Manage users and roles</li>
              <li>Change system and billing settings</li>
              <li>View system audit logs</li>
              <li>Full access to inventory, orders, and suppliers</li>
            </ul>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Staff Member" description="Restricted operational access">
        <div className="flex items-start gap-4 p-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600/20 text-sky-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-200">Staff members can perform daily operational tasks.</p>
            <ul className="text-xs text-slate-500 list-disc list-inside space-y-1">
              <li>View inventory (read-only)</li>
              <li>Create and manage their own orders</li>
              <li>Cannot access system settings or user management</li>
              <li>Cannot delete records</li>
            </ul>
          </div>
        </div>
      </SettingsSection>
      
      <p className="text-xs text-slate-500 text-center pt-4">
        Custom role creation is coming in a future update.
      </p>
    </div>
  );
}
