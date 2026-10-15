"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL_APP_ERROR]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 min-h-screen bg-[#0B0D22] text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-lg text-center rounded-2xl border border-white/10 bg-[#141633]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D9A441]/20 text-[#D9A441]">
            <AlertCircle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Grace of God Mission Asaba
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            A critical application error occurred. We are working to restore service immediately.
          </p>

          {error.digest && (
            <p className="font-mono text-xs text-slate-400 mb-6">
              Error Digest: <span className="text-[#D9A441]">{error.digest}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#D9A441] px-6 text-sm font-bold text-[#0B0D22] hover:brightness-110 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Page</span>
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              <Home className="h-4 w-4" />
              <span>Reload Home</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
