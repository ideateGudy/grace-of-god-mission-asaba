"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Inbox, Video, Plus, Bell, Image as ImageIcon, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/useSessionStore";
import { authFetch } from "@/lib/api/client";

type DashboardStats = {
  publishedSermons?: number;
  upcomingEvents?: number;
  unreadContactMessages?: number;
  unreadPrayerRequests?: number;
  liveHero?: { name: string; slides: number } | null;
};

export default function AdminDashboardPage() {
  const user = useSessionStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    authFetch("/api/v1/admin/stats", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load dashboard statistics.");
        return response.json() as Promise<{ data: DashboardStats }>;
      })
      .then((result) => { if (active) setStats(result.data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const can = (permission: string) => isSuperAdmin || Boolean(user?.permissions.includes(permission));

  const quickActions = [
    can("SERMONS_MANAGE") ? { label: "Add sermon", href: "/admin/sermons/new", icon: Video } : null,
    can("EVENTS_MANAGE") ? { label: "Add event", href: "/admin/events/new", icon: CalendarDays } : null,
    can("ANNOUNCEMENTS_MANAGE") ? { label: "Add announcement", href: "/admin/announcements/new", icon: Bell } : null,
    can("GALLERY_MANAGE") ? { label: "Add photo", href: "/admin/gallery/new", icon: ImageIcon } : null,
    can("HERO_MANAGE") ? { label: "Manage hero", href: "/admin/hero", icon: Sparkles } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const cards = [
    can("SERMONS_MANAGE") && stats?.publishedSermons !== undefined ? { label: "Published sermons", value: stats.publishedSermons, icon: Video } : null,
    can("EVENTS_MANAGE") && stats?.upcomingEvents !== undefined ? { label: "Upcoming events", value: stats.upcomingEvents, icon: CalendarDays } : null,
    can("CONTACT_INBOX") && stats?.unreadContactMessages !== undefined ? { label: "Unread contact messages", value: stats.unreadContactMessages, icon: Inbox } : null,
    can("PRAYER_INBOX") && stats?.unreadPrayerRequests !== undefined ? { label: "Unread prayer requests", value: stats.unreadPrayerRequests, icon: Inbox } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="A live overview based on the permissions assigned to your account." />

      {quickActions.length > 0 && (
        <section aria-labelledby="quick-actions-heading" className="space-y-3">
          <h2 id="quick-actions-heading" className="text-sm font-medium text-muted-foreground">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Button key={href} asChild variant="outline" className="min-h-11 gap-2">
                <Link href={href}>
                  <Plus className="size-4" aria-hidden="true" />
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      {can("HERO_MANAGE") && (
        <GlassCard surface="strong" padding="md">
          <p className="text-sm font-medium text-muted-foreground">What visitors see now</p>
          <p className="mt-2 text-lg font-semibold">{stats?.liveHero ? stats.liveHero.name : "The default welcome slide"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{stats?.liveHero ? `${stats.liveHero.slides} slide${stats.liveHero.slides === 1 ? "" : "s"}` : "No live hero is published."}</p>
        </GlassCard>
      )}

      {error && <p role="status" className="rounded-md border border-border p-4 text-muted-foreground">Dashboard counts are temporarily unavailable. Your admin tools are still available.</p>}

      {cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, icon: Icon }) => (
            <GlassCard key={label} surface="solid" padding="md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{stats ? value : "—"}</p>
                </div>
                <Icon aria-hidden="true" className="size-5 text-primary" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Use the navigation to manage the areas available to your account.</p>
      )}
    </div>
  );
}
