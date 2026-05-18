"use client";

import { SettingsSidebar } from "@/components/settings/SettingsUI";
import { User, Settings2, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const SIDEBAR_ITEMS = [
  { href: "/staff/settings/profile",       label: "Profile",           icon: User },
  { href: "/staff/settings/account",       label: "Account",           icon: Settings2 },
  { href: "/staff/settings/notifications", label: "Notifications",     icon: Bell },
];

export default function StaffSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full gap-8">
      <SettingsSidebar items={SIDEBAR_ITEMS} backHref="/staff/inventory" />
      <div className="flex-1 min-w-0 pb-12">
        {children}
      </div>
    </div>
  );
}
