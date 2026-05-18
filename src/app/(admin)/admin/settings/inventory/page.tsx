"use client";

import { useState, useEffect, useCallback } from "react";
import { getAppSettings, updateAppSettings } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast } from "@/components/settings/SettingsUI";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default function InventorySettingsPage() {
  const [settings, setSettings] = useState({
    low_stock_threshold: "10",
    sku_prefix: "SKU-",
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
        low_stock_threshold: String(data.low_stock_threshold ?? "10"),
        sku_prefix: String(data.sku_prefix ?? "SKU-"),
      });
    });
  }, []);

  function update(key: keyof typeof settings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await updateAppSettings({
        low_stock_threshold: parseInt(settings.low_stock_threshold, 10),
        sku_prefix: settings.sku_prefix,
      });
      if (error) {
        showToast(error, "error");
      } else {
        setDirty(false);
        showToast("Inventory settings saved!", "success");
      }
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-400" /> Inventory Rules
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure stock thresholds and product settings.</p>
      </div>

      <SettingsSection title="Stock Management">
        <SettingsField label="Default Low Stock Threshold" hint="Default reorder level for new products.">
          <input
            type="number"
            min="0"
            value={settings.low_stock_threshold}
            onChange={(e) => update("low_stock_threshold", e.target.value)}
            className="input w-32"
          />
        </SettingsField>
        <SettingsField label="SKU Prefix" hint="Prefix for auto-generated SKUs.">
          <input
            type="text"
            value={settings.sku_prefix}
            onChange={(e) => update("sku_prefix", e.target.value)}
            className="input w-48"
          />
        </SettingsField>
        <SaveBar loading={saving} onSave={handleSave} dirty={dirty} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
