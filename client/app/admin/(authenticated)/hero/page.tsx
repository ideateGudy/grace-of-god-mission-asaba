"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api/client";

type Hero = { id: string; name: string; mode: "SINGLE" | "CAROUSEL"; published: boolean; startsAt: string | null; endsAt: string | null; status: "LIVE" | "SCHEDULED" | "DRAFT" | "ENDED"; slideCount: number; thumbnailUrl: string | null };
export default function HeroAdminPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [liveHeroId, setLiveHeroId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Hero | null>(null);
  const load = useCallback(async () => { try { const response = await authFetch("/api/v1/admin/hero", { cache: "no-store" }); const result = await response.json(); if (!response.ok) throw new Error(result.message ?? "Unable to load heroes."); setHeroes(result.data ?? []); setLiveHeroId(result.meta?.liveHeroId ?? null); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load heroes."); } finally { setLoading(false); } }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches API-backed state after mount.
  useEffect(() => { void load(); }, [load]);
  const action = async (hero: Hero, kind: "publish" | "duplicate" | "delete") => {
    if (kind === "delete") { setPending(hero); return; }
    try { const response = await authFetch(`/api/v1/admin/hero/${hero.id}/${kind === "publish" ? "publish" : "duplicate"}`, { method: kind === "publish" ? "PATCH" : "POST", headers: kind === "publish" ? { "Content-Type": "application/json" } : undefined, body: kind === "publish" ? JSON.stringify({ published: !hero.published }) : undefined }); const result = await response.json(); if (!response.ok) throw new Error(result.message ?? "Hero action failed."); toast.success(kind === "publish" ? (hero.published ? "Hero unpublished." : "Hero published.") : "Draft duplicated."); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Hero action failed."); }
  };
  const remove = async () => { if (!pending) return; try { const response = await authFetch(`/api/v1/admin/hero/${pending.id}`, { method: "DELETE" }); if (!response.ok) throw new Error("Unable to delete this hero."); toast.success("Hero deleted."); setPending(null); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed."); } };
  return <><PageHeader title="Hero manager" description="Choose the welcome content visitors see, set its schedule, and preview each slide." actions={<Button asChild><Link href="/admin/hero/new">Create hero</Link></Button>} />
    {liveHeroId && <p className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">Visitors currently see: <strong>{heroes.find((hero) => hero.id === liveHeroId)?.name ?? "Active hero"}</strong>.</p>}
    {loading ? <p role="status" className="py-10 text-muted-foreground">Loading heroes…</p> : heroes.length === 0 ? <GlassCard surface="solid" padding="lg"><p className="text-muted-foreground">No saved heroes. The public website is showing its default welcome slide.</p></GlassCard> : <div className="space-y-4">{heroes.map((hero) => <GlassCard key={hero.id} surface="solid" padding="md" className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="relative size-16 overflow-hidden rounded-md bg-muted">{hero.thumbnailUrl && <Image src={hero.thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />}</div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{hero.name}</h2><StatusBadge status={hero.status} /></div><p className="text-sm text-muted-foreground">{hero.mode.toLowerCase()} · {hero.slideCount} slide{hero.slideCount === 1 ? "" : "s"}{hero.startsAt ? ` · starts ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(hero.startsAt))}` : ""}</p></div></div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/hero/${hero.id}`}>Edit</Link></Button><Button size="sm" variant="outline" onClick={() => void action(hero, "duplicate")}>Duplicate</Button><Button size="sm" variant={hero.published ? "outline" : "default"} onClick={() => void action(hero, "publish")}>{hero.published ? "Unpublish" : "Publish"}</Button><Button size="sm" variant="destructive" onClick={() => void action(hero, "delete")}>Delete</Button></div></GlassCard>)}</div>}
    <ConfirmDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)} title="Delete this hero?" description="This removes the hero and all of its slides. Visitors will see the default slide when no other hero is live." confirmText="Delete hero" onConfirm={() => void remove()} isDestructive />
  </>;
}
