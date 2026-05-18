"use client";

import { useState, useEffect, useCallback } from "react";
import { getAppSettings, updateAppSettings } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast, ToggleSwitch } from "@/components/settings/SettingsUI";
import { Server } from "lucide-react";

export const dynamic = "force-dynamic";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD"];

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "InvenTrack",
    base_currency: "USD",
    tax_rate: "0",
    timezone: "UTC",
    environment: "production",
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
        company_name: String(data.company_name ?? "InvenTrack"),
        base_currency: String(data.base_currency ?? "USD"),
        tax_rate: String(data.tax_rate ?? "0"),
        timezone: String(data.timezone ?? "UTC"),
        environment: String(data.environment ?? "production"),
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
        company_name: settings.company_name,
        base_currency: settings.base_currency,
        tax_rate: parseFloat(settings.tax_rate),
        timezone: settings.timezone,
        environment: settings.environment,
      });
      if (error) {
        showToast(error, "error");
      } else {
        setDirty(false);
        showToast("System settings saved!", "success");
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
          <Server className="h-5 w-5 text-amber-400" /> System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure global system behavior.</p>
      </div>

      <SettingsSection title="Company">
        <SettingsField label="Company Name">
          <input
            id="sys-company-name"
            type="text"
            value={settings.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            className="input"
          />
        </SettingsField>
        <SettingsField label="Environment" hint="Affects logging and debug features.">
          <div className="flex gap-2">
            {["production", "development"].map((env) => (
              <button
                key={env}
                onClick={() => update("environment", env)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all capitalize ${settings.environment === env ? "border-amber-500 bg-amber-600/20 text-amber-300" : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"}`}
              >
                {env}
              </button>
            ))}
          </div>
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Localization & Finance">
        <SettingsField label="Base Currency">
          <select value={settings.base_currency} onChange={(e) => update("base_currency", e.target.value)} className="input">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </SettingsField>
        <SettingsField label="Default Tax Rate (%)" hint="Applied to new orders.">
          <input
            type="number"
            min="0" max="100" step="0.1"
            value={settings.tax_rate}
            onChange={(e) => update("tax_rate", e.target.value)}
            className="input w-32"
          />
        </SettingsField>
        <SettingsField label="System Timezone">
          <select value={settings.timezone} onChange={(e) => update("timezone", e.target.value)} className="input">
            {["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"].map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </SettingsField>
        <SaveBar loading={saving} onSave={handleSave} dirty={dirty} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
