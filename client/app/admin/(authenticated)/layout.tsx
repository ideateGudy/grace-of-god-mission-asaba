"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

export default function AdminAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState(() => !user);

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data } = await api.auth.me();
        setUser(data as Parameters<typeof setUser>[0]);
      } catch {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("gom_access_token");
          localStorage.removeItem("gom_refresh_token");
        }
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    if (!user) {
      fetchSession();
    }
  }, [user, setUser, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (!user) return null;

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
