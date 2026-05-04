"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header  from "@/components/layout/Header";

// RealtimeIndicator is mounted inside Header — it owns the subscription
// and status display, so no separate bridge component is needed here.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
