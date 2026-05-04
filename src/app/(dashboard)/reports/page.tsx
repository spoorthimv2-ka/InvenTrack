import type { Metadata } from "next";
import ReportsClient from "./ReportsClient";

export const metadata: Metadata = {
  title: "Reports",
  description: "Analytics, charts, and inventory insights.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
