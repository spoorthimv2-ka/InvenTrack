"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { updateProfile, updatePassword } from "@/lib/api/settings";
import { SettingsSection, SettingsField, SaveBar, Toast } from "@/components/settings/SettingsUI";
import { User, KeyRound, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await updateProfile(user.id, { full_name: fullName });
      if (error) {
        showToast(error, "error");
      } else {
        setUser({ ...user, full_name: fullName });
        showToast("Profile updated successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPwd !== confirmPwd) return showToast("Passwords do not match.", "error");
    if (newPwd.length < 6) return showToast("Password must be at least 6 characters.", "error");
    setPwdSaving(true);
    try {
      const { error } = await updatePassword(currentPwd, newPwd);
      if (error) {
        showToast(error, "error");
      } else {
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
        showToast("Password changed successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <User className="h-5 w-5 text-brand-400" /> Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your personal information.</p>
      </div>

      {/* Avatar placeholder */}
      <SettingsSection title="Avatar" description="Your profile picture.">
        <SettingsField label="Photo">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/30 text-xl font-bold text-brand-300">
              {user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="text-xs text-slate-400">Avatar upload coming soon.</p>
              <p className="text-[11px] text-slate-600">Your initial is used in the meantime.</p>
            </div>
          </div>
        </SettingsField>
      </SettingsSection>

      {/* Basic info */}
      <SettingsSection title="Personal Information">
        <SettingsField label="Full Name">
          <input
            id="settings-full-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="Jane Doe"
          />
        </SettingsField>
        <SettingsField label="Email" hint="Contact support to change your email.">
          <input
            type="email"
            value={user?.email ?? ""}
            readOnly
            className="input opacity-60 cursor-not-allowed"
          />
        </SettingsField>
        <SettingsField label="Role">
          <div className="flex items-center gap-2">
            <span className={`badge-${user?.role === "admin" ? "yellow" : "green"} capitalize`}>
              {user?.role}
            </span>
          </div>
        </SettingsField>
        {user?.last_login_at && (
          <SettingsField label="Last Login">
            <p className="text-sm text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {formatDate(user.last_login_at)}
            </p>
          </SettingsField>
        )}
        <SaveBar loading={saving} onSave={handleSaveProfile} dirty={fullName !== (user?.full_name ?? "")} />
      </SettingsSection>

      {/* Change password */}
      <SettingsSection title="Change Password" description="Use a strong password with at least 6 characters.">
        <SettingsField label="Current Password">
          <input
            id="settings-current-pwd"
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </SettingsField>
        <SettingsField label="New Password">
          <input
            id="settings-new-pwd"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </SettingsField>
        <SettingsField label="Confirm New Password">
          <input
            id="settings-confirm-pwd"
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </SettingsField>
        <SaveBar loading={pwdSaving} onSave={handleChangePassword} dirty={!!(currentPwd && newPwd && confirmPwd)} />
      </SettingsSection>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
