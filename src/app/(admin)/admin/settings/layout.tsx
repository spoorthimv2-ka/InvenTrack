"use client";

import { SettingsSidebar } from "@/components/settings/SettingsUI";
import {
  User, Settings2, Bell, Users, Shield, Server,
  Package, Truck, Receipt, FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SIDEBAR_ITEMS = [
  // User/Common
  { href: "/admin/settings/profile",       label: "Profile",           icon: User },
  { href: "/admin/settings/account",       label: "Account",           icon: Settings2 },
  { href: "/admin/settings/notifications", label: "Notifications",     icon: Bell },
  // Admin-only
  { href: "/admin/settings/users",         label: "Users",             icon: Users },
  { href: "/admin/settings/roles",         label: "Roles & Permissions", icon: Shield },
  { href: "/admin/settings/system",        label: "System",            icon: Server },
  { href: "/admin/settings/inventory",     label: "Inventory Rules",   icon: Package },
  { href: "/admin/settings/suppliers",     label: "Supplier Defaults", icon: Truck },
  { href: "/admin/settings/billing",       label: "Billing",           icon: Receipt },
  { href: "/admin/settings/audit",         label: "Audit Logs",        icon: FileText },
];

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full gap-8">
      <SettingsSidebar items={SIDEBAR_ITEMS} backHref="/admin/inventory" />
      <div className="flex-1 min-w-0 pb-12">
        {children}
      </div>
    </div>
  );
}
