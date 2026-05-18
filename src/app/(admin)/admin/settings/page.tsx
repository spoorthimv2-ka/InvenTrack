"use client";

import { requireAdmin } from "@/lib/auth/getUserRole";
import Link from "next/link";
import {
  User, Settings2, Bell, Users, Shield, Server,
  Package, Truck, Receipt, FileText, ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const COMMON_ITEMS = [
  { href: "/admin/settings/profile",       label: "Profile",           icon: User,      desc: "Name, avatar, password" },
  { href: "/admin/settings/account",       label: "Account",           icon: Settings2, desc: "Theme, timezone, formats" },
  { href: "/admin/settings/notifications", label: "Notifications",     icon: Bell,      desc: "Email & alert preferences" },
];

const ADMIN_ITEMS = [
  { href: "/admin/settings/users",         label: "Users",             icon: Users,     desc: "Manage team members" },
  { href: "/admin/settings/roles",         label: "Roles & Permissions", icon: Shield,  desc: "Access control" },
  { href: "/admin/settings/system",        label: "System",            icon: Server,    desc: "Company, currency, tax" },
  { href: "/admin/settings/inventory",     label: "Inventory Rules",   icon: Package,   desc: "Stock thresholds & SKU format" },
  { href: "/admin/settings/suppliers",     label: "Supplier Defaults", icon: Truck,     desc: "Lead times & reorder logic" },
  { href: "/admin/settings/billing",       label: "Billing",           icon: Receipt,   desc: "Plan & usage" },
  { href: "/admin/settings/audit",         label: "Audit Logs",        icon: FileText,  desc: "System activity log" },
];

export default function AdminSettingsIndexPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account and system configuration.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">Your Account</p>
        {COMMON_ITEMS.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} className="card p-4 flex items-center gap-4 hover:border-brand-500/40 transition-colors group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/20">
              <Icon className="h-4 w-4 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">Administration</p>
        {ADMIN_ITEMS.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} className="card p-4 flex items-center gap-4 hover:border-amber-500/30 transition-colors group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600/10">
              <Icon className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
