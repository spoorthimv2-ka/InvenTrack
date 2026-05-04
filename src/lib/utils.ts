import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Format a date string to a readable format */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

/** Truncate a string to a max length */
export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Derive inventory status badge color */
export function statusColor(
  status: string
): "green" | "yellow" | "red" | "gray" {
  switch (status) {
    case "in_stock":
    case "active":
    case "delivered":
      return "green";
    case "low_stock":
    case "pending":
    case "confirmed":
      return "yellow";
    case "out_of_stock":
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

/** Generate a random SKU for new items */
export function generateSKU(prefix = "SKU"): string {
  return `${prefix}-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
}
