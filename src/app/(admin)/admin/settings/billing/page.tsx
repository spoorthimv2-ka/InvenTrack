"use client";

import { SettingsSection } from "@/components/settings/SettingsUI";
import { Receipt, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BillingSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-amber-400" /> Billing & Plan
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your subscription and usage.</p>
      </div>

      <div className="card p-6 border-brand-500/30 bg-brand-500/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/10 blur-3xl rounded-full" />
        <h2 className="text-lg font-bold text-slate-100 mb-1">Current Plan: Beta Preview</h2>
        <p className="text-sm text-slate-400 mb-6">You are currently using the free early access version of InvenTrack.</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited Products
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Unlimited Orders
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Realtime collaboration
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Standard Support
          </div>
        </div>

        <button className="btn-primary px-4 py-2 text-sm opacity-50 cursor-not-allowed" disabled>
          Upgrade Plan (Coming Soon)
        </button>
      </div>

      <SettingsSection title="Usage Limits" description="Your current resource usage for the month.">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Database Storage</span>
              <span className="text-slate-300 font-medium">12 MB / 500 MB</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 w-[2%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Monthly Orders</span>
              <span className="text-slate-300 font-medium">12 / 1,000</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[1%]" />
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
