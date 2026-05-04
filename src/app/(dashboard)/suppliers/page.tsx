import type { Metadata } from "next";
import SuppliersClient from "./SuppliersClient";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Manage your supplier network.",
};

export default function SuppliersPage() {
  return <SuppliersClient />;
}
