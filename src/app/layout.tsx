import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: { default: "InvenTrack", template: "%s | InvenTrack" },
  description:
    "Production-grade inventory management — track stock, orders, and suppliers in real time.",
  keywords: ["inventory", "management", "stock", "orders", "suppliers"],
  authors: [{ name: "InvenTrack" }],
  robots: "noindex,nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
