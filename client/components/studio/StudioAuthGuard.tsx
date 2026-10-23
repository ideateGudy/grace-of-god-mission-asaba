"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { api } from "@/lib/api/client";
import { BroadcastStudio } from "@/components/studio/BroadcastStudio";
import Image from "next/image";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function StudioAuthGuard() {
  const { user, setUser } = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(() => !user);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data } = await api.auth.me();
        setUser(data as Parameters<typeof setUser>[0]);
      } catch {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("gom_access_token");
          localStorage.removeItem("gom_refresh_token");
        }
        router.push("/admin/login?redirect=/studio");
      } finally {
        setLoading(false);
      }
    }

    if (!user) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [user, setUser, router]);

  if (loading) {
    return (
      <div className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#060714] text-white select-none overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background: "radial-gradient(ellipse at 50% 20%, #171B38 0%, #0B0E20 45%, #05060E 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400/60 bg-black/60 shadow-[0_0_30px_rgba(217,164,65,0.3)] p-1 animate-pulse">
            <Image
              src={CHURCH_LOGO_PATH}
              alt="Grace of God Mission Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
              Initializing Broadcast Studio
            </h2>
            <p className="text-[11px] text-amber-300/80 font-medium tracking-wider uppercase">
              Verifying Media Crew Authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess =
    user?.role === "SUPER_ADMIN" ||
    (Array.isArray(user?.permissions) && user.permissions.includes("LIVESTREAM_MANAGE"));

  if (!hasAccess) {
    return (
      <div className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#060714] text-white p-6 select-none overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background: "radial-gradient(ellipse at 50% 20%, #2a1117 0%, #0B0E20 50%, #05060E 100%)",
          }}
        />
        <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-8 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold tracking-tight text-white">Access Restricted</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You do not have permission to operate the Broadcast Studio switcher.
            </p>
            <p className="text-[11px] text-slate-400 bg-slate-800/80 rounded-md py-1.5 px-3 border border-slate-700/60 inline-block font-mono">
              Required Permission: <span className="text-amber-400 font-semibold">LIVESTREAM_MANAGE</span>
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Please contact a Super-Admin to grant you Livestream & Broadcast permissions in the admin dashboard.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full">
            <Button asChild variant="outline" className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <BroadcastStudio />;
}
