"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Loader2,
  Eye,
  Check,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { authFetch } from "@/lib/api/client";
import type { DevotionDto, CreateDevotionDto } from "@ggm/types";

export default function AdminDevotionsPage() {
  const [rows, setRows] = useState<DevotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DevotionDto | null>(null);

  const [formData, setFormData] = useState<CreateDevotionDto>({
    date: new Date().toISOString().slice(0, 10),
    title: "",
    scriptureRef: "",
    scriptureText: "",
    content: "",
    prayer: "",
    published: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/v1/admin/devotions", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load devotions.");
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      toast.error("Unable to load devotions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      title: "",
      scriptureRef: "",
      scriptureText: "",
      content: "",
      prayer: "",
      published: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (devotion: DevotionDto) => {
    setEditingId(devotion.id);
    setFormData({
      date: devotion.date,
      title: devotion.title,
      scriptureRef: devotion.scriptureRef,
      scriptureText: devotion.scriptureText,
      content: devotion.content,
      prayer: devotion.prayer || "",
      published: devotion.published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `/api/v1/admin/devotions/${encodeURIComponent(editingId)}`
        : "/api/v1/admin/devotions";
      const method = editingId ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          title: formData.title.trim(),
          scriptureRef: formData.scriptureRef.trim(),
          scriptureText: formData.scriptureText.trim(),
          content: formData.content.trim(),
          prayer: formData.prayer?.trim() || undefined,
          published: formData.published,
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.message || "Failed to save devotion.");
      }

      toast.success(editingId ? "Devotion updated successfully." : "Devotion scheduled and published.");
      setDialogOpen(false);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save devotion.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (devotion: DevotionDto) => {
    try {
      const res = await authFetch(`/api/v1/admin/devotions/${encodeURIComponent(devotion.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !devotion.published }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Update failed.");
      toast.success(!devotion.published ? "Devotion published." : "Devotion unpublished.");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update devotion status.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      const res = await authFetch(`/api/v1/admin/devotions/${encodeURIComponent(pendingDelete.id)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Delete failed.");
      toast.success("Devotion permanently deleted.");
      setPendingDelete(null);
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete devotion.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Daily Devotions"
          description="Write, schedule, and publish spiritual devotionals and daily verses for church members."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button asChild variant="outline" size="sm">
            <a href="/devotion" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              <span>Preview Live Page</span>
            </a>
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>New Devotion</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading scheduled devotions...</span>
        </div>
      ) : rows.length === 0 ? (
        <GlassCard surface="solid" padding="lg" className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
          <h3 className="font-bold text-foreground text-lg">No Devotions Scheduled Yet</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            Click below to create your first daily verse and reflection for the congregation.
          </p>
          <Button onClick={openCreate} className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            <span>Create First Devotion</span>
          </Button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <GlassCard
              key={row.id}
              surface="solid"
              padding="md"
              className="flex flex-col justify-between space-y-4 hover:border-primary/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5 text-xs">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{row.date}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      row.published
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.published ? "Published" : "Draft"}
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-1">{row.title}</h3>
                <p className="text-xs font-semibold text-primary/90">{row.scriptureRef}</p>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed italic">
                  "{row.scriptureText}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePublished(row)}
                  className={`text-xs h-8 ${row.published ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"}`}
                >
                  {row.published ? "Unpublish" : "Publish"}
                </Button>

                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(row)}>
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive/80 hover:text-destructive"
                    onClick={() => setPendingDelete(row)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingId ? "Edit Devotion" : "New Daily Devotion"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide the Scripture passage, biblical reflection, and closing prayer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="devotion-date">Scheduled Date (YYYY-MM-DD) *</Label>
                <Input
                  id="devotion-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="devotion-title">Devotion Title *</Label>
                <Input
                  id="devotion-title"
                  placeholder="e.g. Walking in the Power of the Holy Spirit"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  required
                  maxLength={200}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scriptureRef">Scripture Reference *</Label>
              <Input
                id="scriptureRef"
                placeholder="e.g. Galatians 5:16 / Romans 8:28 / Psalm 23:1"
                value={formData.scriptureRef}
                onChange={(e) => setFormData((p) => ({ ...p, scriptureRef: e.target.value }))}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scriptureText">Scripture Passage Text *</Label>
              <Textarea
                id="scriptureText"
                placeholder="Paste the Bible verse or passage text..."
                value={formData.scriptureText}
                onChange={(e) => setFormData((p) => ({ ...p, scriptureText: e.target.value }))}
                rows={2}
                required
                maxLength={2000}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Devotional Reflection *</Label>
              <Textarea
                id="content"
                placeholder="Write the full pastoral message and practical application..."
                value={formData.content}
                onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                rows={6}
                required
                maxLength={10000}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prayer">Closing Prayer for Today (Optional)</Label>
              <Textarea
                id="prayer"
                placeholder="e.g. Lord Jesus, empower my steps today and fill my heart with peace..."
                value={formData.prayer || ""}
                onChange={(e) => setFormData((p) => ({ ...p, prayer: e.target.value }))}
                rows={2}
                maxLength={2000}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-card">
              <div>
                <Label htmlFor="publish-toggle" className="text-sm font-semibold cursor-pointer">
                  Publish Immediately
                </Label>
                <p className="text-xs text-muted-foreground">
                  Published devotions appear on the public page for worshippers.
                </p>
              </div>
              <Switch
                id="publish-toggle"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, published: checked }))
                }
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-32">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <span>{editingId ? "Update Devotion" : "Save Devotion"}</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this devotion permanently?"
        description="This scheduled devotional entry will be permanently removed from the archives."
        confirmText="Delete permanently"
        onConfirm={() => void remove()}
        isDestructive
      />
    </div>
  );
}
