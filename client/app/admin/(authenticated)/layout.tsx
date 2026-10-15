"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";

export default function AdminAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState(() => !user);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const { data } = await res.json();
          setUser(data);
        } else {
          setUser(null);
          router.push("/admin/login");
        }
      } catch (e) {
        console.error("Session check failed", e);
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
