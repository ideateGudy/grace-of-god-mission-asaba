"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Check,
  X,
  Trash2,
  Star,
  Loader2,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { authFetch } from "@/lib/api/client";
import type { AdminTestimonyDto, TestimonyStatus } from "@ggm/types";

export default function AdminTestimoniesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [rows, setRows] = useState<AdminTestimonyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<AdminTestimonyDto | null>(null);
  const [selectedStory, setSelectedStory] = useState<AdminTestimonyDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await authFetch(`/api/v1/admin/testimonies${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load testimonies.");
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      toast.error("Unable to load testimonies.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: TestimonyStatus) => {
    try {
      const res = await authFetch(`/api/v1/admin/testimonies/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Status update failed.");
      toast.success(status === "APPROVED" ? "Testimony approved!" : "Testimony marked as rejected.");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await authFetch(`/api/v1/admin/testimonies/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Feature update failed.");
      toast.success(!currentFeatured ? "Testimony marked as featured!" : "Removed from featured.");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle feature flag.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      const res = await authFetch(`/api/v1/admin/testimonies/${encodeURIComponent(pendingDelete.id)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Delete failed.");
      toast.success("Testimony permanently deleted.");
      setPendingDelete(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete testimony.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Testimonies Moderation"
          description="Review member praise reports, verify authenticity, and approve stories for the public wall."
        />
        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
          <a href="/testimonies" target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 mr-2" />
            <span>Open Public Wall</span>
          </a>
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="ALL">All Submissions</TabsTrigger>
          <TabsTrigger value="PENDING">Pending Review</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading testimonies...</span>
        </div>
      ) : rows.length === 0 ? (
        <GlassCard surface="solid" padding="lg" className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">No testimonies found</p>
          <p className="text-xs mt-1">There are no records matching the selected status filter.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <GlassCard
              key={row.id}
              surface="solid"
              padding="md"
              className={`space-y-3 transition-colors ${
                row.status === "PENDING"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : row.status === "APPROVED"
                  ? "border-emerald-500/30"
                  : "border-border/60 opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{row.title}</h3>
                    {row.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-gold" />
                        <span>Featured</span>
                      </span>
                    )}
                    {row.isAnonymous && (
                      <span className="rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[11px] font-semibold">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Author: <strong className="text-foreground">{row.authorName}</strong>
                    {[row.phone, row.email].filter(Boolean).length > 0 && (
                      <span> · {[row.phone, row.email].filter(Boolean).join(" · ")}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      row.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : row.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                        : "bg-destructive/10 text-destructive border border-destructive/30"
                    }`}
                  >
                    {row.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Africa/Lagos",
                    }).format(new Date(row.createdAt))}
                  </span>
                </div>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {row.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  {row.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void updateStatus(row.id, "APPROVED")}
                      className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                  )}
                  {row.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void updateStatus(row.id, "REJECTED")}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>
                  )}
                  {row.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant={row.featured ? "secondary" : "outline"}
                      onClick={() => void toggleFeatured(row.id, row.featured)}
                      className="gap-1.5"
                    >
                      <Star className={`w-3.5 h-3.5 ${row.featured ? "fill-gold text-gold" : ""}`} />
                      <span>{row.featured ? "Unfeature" : "Feature Story"}</span>
                    </Button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPendingDelete(row)}
                  className="text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this testimony permanently?"
        description="The testimony and all associated contact details will be removed."
        confirmText="Delete permanently"
        onConfirm={() => void remove()}
        isDestructive
      />
    </div>
  );
}
