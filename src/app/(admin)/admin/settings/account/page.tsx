"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getUserPreferences, upsertUserPreferences } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast } from "@/components/settings/SettingsUI";
import type { UserPreferences } from "@/types";

export const dynamic = "force-dynamic";

const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];
const DATE_FORMATS = ["MMM dd, yyyy", "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"];
const LANGUAGES = [{ value: "en", label: "English" }, { value: "es", label: "Español" }, { value: "fr", label: "Français" }];

type PrefsForm = Omit<UserPreferences, "user_id" | "created_at" | "updated_at">;

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<PrefsForm>({
    theme: "dark", language: "en", timezone: "UTC",
    date_format: "MMM dd, yyyy", number_format: "en-US",
    notify_email: true, notify_low_stock: true,
    notify_order_updates: true, notify_system_alerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.id).then((data) => {
      if (data) setPrefs({
        theme: data.theme, language: data.language, timezone: data.timezone,
        date_format: data.date_format, number_format: data.number_format,
        notify_email: data.notify_email, notify_low_stock: data.notify_low_stock,
        notify_order_updates: data.notify_order_updates, notify_system_alerts: data.notify_system_alerts,
      });
    });
  }, [user]);

  function update<K extends keyof PrefsForm>(key: K, value: PrefsForm[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await upsertUserPreferences(user.id, prefs);
      if (error) {
        showToast(error, "error");
      } else {
        setDirty(false);
        showToast("Preferences saved!", "success");
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
        <h1 className="text-xl font-bold text-slate-100">Account Preferences</h1>
        <p className="text-sm text-slate-400 mt-1">Customize how InvenTrack looks and behaves for you.</p>
      </div>

      <SettingsSection title="Display" description="Appearance and localization.">
        <SettingsField label="Theme">
          <div className="flex gap-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => update("theme", t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all capitalize ${prefs.theme === t ? "border-brand-500 bg-brand-600/20 text-brand-300" : "border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </SettingsField>

        <SettingsField label="Language">
          <select value={prefs.language} onChange={(e) => update("language", e.target.value)} className="input">
            {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </SettingsField>

        <SettingsField label="Timezone">
          <select value={prefs.timezone} onChange={(e) => update("timezone", e.target.value)} className="input">
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </SettingsField>

        <SettingsField label="Date Format">
          <select value={prefs.date_format} onChange={(e) => update("date_format", e.target.value)} className="input">
            {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </SettingsField>

        <SaveBar loading={saving} onSave={handleSave} dirty={dirty} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
