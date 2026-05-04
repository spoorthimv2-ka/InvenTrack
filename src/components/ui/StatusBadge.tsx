import { cn, statusColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const colorMap: Record<ReturnType<typeof statusColor>, string> = {
  green:  "badge-green",
  yellow: "badge-yellow",
  red:    "badge-red",
  gray:   "badge-gray",
};

const dotColorMap: Record<ReturnType<typeof statusColor>, string> = {
  green:  "bg-emerald-400",
  yellow: "bg-amber-400",
  red:    "bg-red-400",
  gray:   "bg-slate-400",
};

export function StatusBadge({ status, label, className }: BadgeProps) {
  const color = statusColor(status);
  return (
    <span className={cn(colorMap[color], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColorMap[color])} />
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
