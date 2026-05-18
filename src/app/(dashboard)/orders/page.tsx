import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage purchase and fulfillment orders.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
