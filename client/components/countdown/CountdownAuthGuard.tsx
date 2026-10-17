"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { api } from "@/lib/api/client";
import { ChurchCountdown } from "@/components/countdown/ChurchCountdown";
import Image from "next/image";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";

export function CountdownAuthGuard() {
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
        router.push("/admin/login?redirect=/countdown");
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
              GRACE OF GOD MISSION
            </h2>
            <p className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase">
              VERIFYING ADMIN ACCESS...
            </p>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mt-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ChurchCountdown />;
}
