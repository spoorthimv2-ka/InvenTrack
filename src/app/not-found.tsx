import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-center">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-indigo-800/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-slate-200">Page Not Found</h2>
        <p className="mt-4 text-sm text-slate-400">
          The page you are looking for doesn&apos;t exist or has been moved to another URL.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 hover:scale-[1.02]"
          >
            Go back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
}
