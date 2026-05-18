"use client";

import { useState, useEffect, useCallback } from "react";
import { getAppSettings, updateAppSettings } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast, ToggleSwitch } from "@/components/settings/SettingsUI";
import { Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SupplierSettingsPage() {
  const [settings, setSettings] = useState({
    default_lead_days: "7",
    auto_reorder: false,
    auto_confirm_orders: false,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    getAppSettings().then((data) => {
      setSettings({
        default_lead_days: String(data.default_lead_days ?? "7"),
        auto_reorder: Boolean(data.auto_reorder),
        auto_confirm_orders: Boolean(data.auto_confirm_orders),
      });
    });
  }, []);

  function update(key: keyof typeof settings, value: string | boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await updateAppSettings({
        default_lead_days: parseInt(settings.default_lead_days, 10),
        auto_reorder: settings.auto_reorder,
        auto_confirm_orders: settings.auto_confirm_orders,
      });
      if (error) {
        showToast(error, "error");
      } else {
        setDirty(false);
        showToast("Supplier settings saved!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-400" /> Supplier & Order Defaults
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure lead times and order workflow automation.</p>
      </div>

      <SettingsSection title="Lead Times">
        <SettingsField label="Default Lead Time (Days)" hint="Applied when creating a new supplier.">
          <input
            type="number"
            min="0"
            value={settings.default_lead_days}
            onChange={(e) => update("default_lead_days", e.target.value)}
            className="input w-32"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Automation">
        <SettingsField label="Auto-Reorder" hint="Automatically draft purchase orders for low stock items.">
          <ToggleSwitch
            id="sys-auto-reorder"
            checked={settings.auto_reorder}
            onChange={(v) => update("auto_reorder", v)}
          />
        </SettingsField>
        <SettingsField label="Auto-Confirm Orders" hint="Skip draft status for new purchase orders.">
          <ToggleSwitch
            id="sys-auto-confirm"
            checked={settings.auto_confirm_orders}
            onChange={(v) => update("auto_confirm_orders", v)}
          />
        </SettingsField>
        <SaveBar loading={saving} onSave={handleSave} dirty={dirty} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
