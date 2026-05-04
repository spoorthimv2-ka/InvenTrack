"use client";

import { Bell, Search } from "lucide-react";
import { usePathname }   from "next/navigation";
import { useAuthStore }  from "@/store/auth.store";
import { RealtimeIndicator } from "@/components/realtime/RealtimeIndicator";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/inventory": { title: "Inventory",  subtitle: "Manage your products and stock" },
  "/orders":    { title: "Orders",     subtitle: "Purchase and fulfillment orders" },
  "/suppliers": { title: "Suppliers",  subtitle: "Manage your supplier network" },
  "/reports":   { title: "Reports",    subtitle: "Analytics and insights" },
  "/settings":  { title: "Settings",   subtitle: "Account and preferences" },
};

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const matched = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key));
  const { title, subtitle } = matched?.[1] ?? { title: "InvenTrack", subtitle: "" };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700/60 bg-slate-900/60 px-6 backdrop-blur-sm">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Realtime connection status */}
        <RealtimeIndicator />

        {/* Search hint */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-500 sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search…</span>
          <kbd className="ml-2 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          id="header-notifications"
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/30 text-sm font-semibold text-brand-300 ring-2 ring-brand-500/20">
          {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
