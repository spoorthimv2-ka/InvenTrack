import type { Metadata } from "next";
import InventoryClient from "./InventoryClient";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Browse and manage all inventory items.",
};

export default function InventoryPage() {
  return <InventoryClient />;
}
