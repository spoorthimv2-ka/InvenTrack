"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router   = useRouter();
  const setUser  = useAuthStore((s) => s.setUser);

  const [tab,      setTab]      = useState<"signin" | "signup">("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        setUser(profile);
        router.push("/inventory");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user) {
          router.push("/inventory");
        } else {
          setError("Check your email to confirm your account.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="card p-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 glow-accent">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient">InvenTrack</h1>
            <p className="mt-1 text-xs text-slate-500">
              {tab === "signin" ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-slate-800/80 p-1">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              id={`login-tab-${t}`}
              onClick={() => { setTab(t); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                tab === t
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label htmlFor="login-name" className="mb-1.5 block text-xs font-medium text-slate-400">
                Full Name
              </label>
              <input
                id="login-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-slate-400">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 px-3 py-2.5 text-xs text-red-400 ring-1 ring-red-500/30">
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tab === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          By signing in you agree to our{" "}
          <span className="text-brand-400 cursor-pointer hover:underline">Terms of Service</span>
        </p>

        {tab === "signin" && (
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-800/50 pt-5">
            <p className="text-xs text-slate-500">Quick Demo Access (Auto-fill):</p>
            <div className="flex w-full gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setEmail("admin@example.com");
                  setPassword("admin123");
                }} 
                className="flex-1 rounded-md border border-brand-500/30 bg-brand-500/10 py-1.5 text-xs text-brand-400 hover:bg-brand-500/20"
              >
                Admin Role
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setEmail("staff@example.com");
                  setPassword("staff123");
                }} 
                className="flex-1 rounded-md border border-slate-600/50 bg-slate-800 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Staff Role
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
