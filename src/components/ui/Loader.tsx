import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export function Loader({ className, size = "md", label }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}>
      <Loader2 className={cn("animate-spin text-brand-400", sizeMap[size])} />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader size="lg" label="Loading…" />
    </div>
  );
}
