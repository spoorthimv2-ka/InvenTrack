import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "indigo" | "emerald" | "amber" | "red" | "blue" | "gray";
  className?: string;
}

const accentMap = {
  indigo:  { icon: "bg-brand-600/20 text-brand-400",  border: "hover:border-brand-500/40" },
  emerald: { icon: "bg-emerald-600/20 text-emerald-400", border: "hover:border-emerald-500/40" },
  amber:   { icon: "bg-amber-600/20 text-amber-400",   border: "hover:border-amber-500/40" },
  red:     { icon: "bg-red-600/20 text-red-400",       border: "hover:border-red-500/40" },
  blue:    { icon: "bg-blue-600/20 text-blue-400",     border: "hover:border-blue-500/40" },
  gray:    { icon: "bg-slate-600/20 text-slate-400",   border: "hover:border-slate-500/40" },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = "indigo",
  className,
}: StatCardProps) {
  const { icon: iconClass, border } = accentMap[accent];
  return (
    <div className={cn("stat-card", border, className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={cn("rounded-lg p-2", iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs font-medium",
            trend.value >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  );
}
