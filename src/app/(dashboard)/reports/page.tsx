import type { Metadata } from "next";
import ReportsClient from "./ReportsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports",
  description: "Analytics, charts, and inventory insights.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
