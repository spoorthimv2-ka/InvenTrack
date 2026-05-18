"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SettingsNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

interface SettingsSidebarProps {
  items: SettingsNavItem[];
  backHref: string;
}

export function SettingsSidebar({ items, backHref }: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      <div className="sticky top-0">
        <Link
          href={backHref}
          className="mb-4 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Settings
        </p>
        <nav className="space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-brand-600/20 text-brand-300 ring-1 ring-brand-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// ── Reusable settings page primitives ──────────────────────────────────────

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface SettingsFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function SettingsField({ label, hint, children }: SettingsFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-6">
      <div className="w-full sm:w-44 shrink-0">
        <p className="text-xs font-medium text-slate-300">{label}</p>
        {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface SaveBarProps {
  loading: boolean;
  onSave: () => void;
  dirty?: boolean;
}

export function SaveBar({ loading, onSave, dirty = true }: SaveBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button
        onClick={onSave}
        disabled={loading || !dirty}
        className="btn-primary px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving…
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

interface ToastProps {
  message: string;
  type: "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl ring-1 animate-slide-in",
        type === "success"
          ? "bg-emerald-900/80 text-emerald-300 ring-emerald-500/30"
          : "bg-red-900/80 text-red-300 ring-red-500/30"
      )}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        checked ? "bg-brand-600" : "bg-slate-700"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
