"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getUserPreferences, upsertUserPreferences } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast, ToggleSwitch } from "@/components/settings/SettingsUI";
import { Bell } from "lucide-react";
import type { UserPreferences } from "@/types";

export const dynamic = "force-dynamic";

type NotifPrefs = Pick<UserPreferences, "notify_email" | "notify_low_stock" | "notify_order_updates" | "notify_system_alerts">;

export default function NotificationsSettingsPage() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<NotifPrefs>({
    notify_email: true,
    notify_low_stock: true,
    notify_order_updates: true,
    notify_system_alerts: true,
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
        notify_email: data.notify_email,
        notify_low_stock: data.notify_low_stock,
        notify_order_updates: data.notify_order_updates,
        notify_system_alerts: data.notify_system_alerts,
      });
    });
  }, [user]);

  function toggle(key: keyof NotifPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
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
        showToast("Notification preferences saved!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  const items: { key: keyof NotifPrefs; label: string; desc: string }[] = [
    { key: "notify_email",         label: "Email Notifications",  desc: "Receive summaries and alerts via email" },
    { key: "notify_low_stock",     label: "Low Stock Alerts",     desc: "Get notified when items fall below reorder level" },
    { key: "notify_order_updates", label: "Order Updates",        desc: "Updates on order status changes" },
    { key: "notify_system_alerts", label: "System Alerts",        desc: "Important system-level notifications" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-400" /> Notifications
        </h1>
        <p className="text-sm text-slate-400 mt-1">Control which notifications you receive.</p>
      </div>

      <SettingsSection title="Notification Preferences">
        {items.map(({ key, label, desc }) => (
          <SettingsField key={key} label={label} hint={desc}>
            <ToggleSwitch
              id={`notif-${key}`}
              checked={prefs[key]}
              onChange={() => toggle(key)}
            />
          </SettingsField>
        ))}
        <SaveBar loading={saving} onSave={handleSave} dirty={dirty} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
