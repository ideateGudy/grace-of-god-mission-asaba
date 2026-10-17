"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  BookOpen,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Flame,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/shared/GlassCard";
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
    series: "DAILY GRACE",
    title: "",
    textRef: "",
    scriptureRef: "",
    scriptureText: "",
    content: "",
    prayer: "",
    bibleIn365Days: "",
    actionPoint: "",
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
      series: "DAILY GRACE",
      title: "",
      textRef: "",
      scriptureRef: "",
      scriptureText: "",
      content: "",
      prayer: "",
      bibleIn365Days: "",
      actionPoint: "",
      published: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (devotion: DevotionDto) => {
    setEditingId(devotion.id);
    setFormData({
      date: devotion.date,
      series: devotion.series || "DAILY GRACE",
      title: devotion.title,
      textRef: devotion.textRef || "",
      scriptureRef: devotion.scriptureRef,
      scriptureText: devotion.scriptureText,
      content: devotion.content,
      prayer: devotion.prayer || "",
      bibleIn365Days: devotion.bibleIn365Days || "",
      actionPoint: devotion.actionPoint || "",
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
          series: formData.series?.trim() || "DAILY GRACE",
          title: formData.title.trim(),
          textRef: formData.textRef?.trim() || undefined,
          scriptureRef: formData.scriptureRef.trim(),
          scriptureText: formData.scriptureText.trim(),
          content: formData.content.trim(),
          prayer: formData.prayer?.trim() || undefined,
          bibleIn365Days: formData.bibleIn365Days?.trim() || undefined,
          actionPoint: formData.actionPoint?.trim() || undefined,
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
      });
      if (!res.ok) throw new Error("Could not update publish state.");
      toast.success(devotion.published ? "Devotion moved to drafts." : "Devotion published live.");
      await load();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    try {
      const res = await authFetch(`/api/v1/admin/devotions/${encodeURIComponent(pendingDelete.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete devotion.");
      toast.success("Devotion deleted permanently.");
      setPendingDelete(null);
      await load();
    } catch {
      toast.error("Failed to delete devotion.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Daily Devotions Manager
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold border border-gold/30">
              <Sparkles className="w-3 h-3" />
              <span>Daily Grace</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Schedule and publish daily Scripture readings, verses of the day, pastoral reflections, closing prayers, 365-day reading plans, and practical action points.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 shrink-0 rounded-xl">
          <Plus className="w-4 h-4" />
          <span>New Daily Devotion</span>
        </Button>
      </div>

      {/* Grid of Devotions */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-xs text-muted-foreground">Loading devotional schedule...</p>
        </div>
      ) : rows.length === 0 ? (
        <GlassCard surface="strong" padding="lg" className="text-center py-16 border-dashed">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-display text-lg font-bold">No Devotions Scheduled</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click below to create your first daily verse and reflection for the congregation.
          </p>
          <Button onClick={openCreate} className="mt-4 gap-2 rounded-xl">
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{row.date}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                      {row.series || "DAILY GRACE"}
                    </span>
                  </div>
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

                <div>
                  <h3 className="font-bold text-base text-foreground line-clamp-1">{row.title}</h3>
                  {row.textRef && (
                    <p className="text-[11px] font-bold text-gold tracking-wide mt-0.5">
                      TEXT: {row.textRef}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-primary/90 mt-1">
                    VERSE: {row.scriptureRef}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic mt-0.5">
                    "{row.scriptureText}"
                  </p>
                </div>

                {row.actionPoint && (
                  <div className="rounded-lg bg-gold/10 p-2 text-[11px] font-semibold text-foreground border border-gold/20">
                    <span className="font-bold text-gold uppercase text-[9px] block">Action Point:</span>
                    <span className="line-clamp-1">{row.actionPoint}</span>
                  </div>
                )}
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
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span>{editingId ? "Edit Devotion" : "New Daily Devotion"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure the church's Daily Grace devotional publication format.
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
                <Label htmlFor="devotion-series">Series / Header Label</Label>
                <Input
                  id="devotion-series"
                  placeholder="e.g. DAILY GRACE"
                  value={formData.series || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, series: e.target.value }))}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="devotion-title">Devotion Title *</Label>
                <Input
                  id="devotion-title"
                  placeholder="e.g. LET GOD TRANSFORM YOUR LIFE"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="textRef">Scripture Reading / TEXT (Optional)</Label>
                <Input
                  id="textRef"
                  placeholder="e.g. EPHESIANS 4:22-24"
                  value={formData.textRef || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, textRef: e.target.value }))}
                  maxLength={150}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scriptureRef">Verse of the Day Reference *</Label>
              <Input
                id="scriptureRef"
                placeholder="e.g. 2 CORINTHIANS 5:17"
                value={formData.scriptureRef}
                onChange={(e) => setFormData((p) => ({ ...p, scriptureRef: e.target.value }))}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scriptureText">Verse of the Day Text *</Label>
              <Textarea
                id="scriptureText"
                placeholder='e.g. "THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW"'
                value={formData.scriptureText}
                onChange={(e) => setFormData((p) => ({ ...p, scriptureText: e.target.value }))}
                rows={2}
                required
                maxLength={2000}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Devotional Message / Reflection *</Label>
              <Textarea
                id="content"
                placeholder="Write or paste the full devotional message paragraphs..."
                value={formData.content}
                onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                rows={6}
                required
                maxLength={15000}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prayer">Closing PRAYER (Optional)</Label>
              <Textarea
                id="prayer"
                placeholder="e.g. Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen."
                value={formData.prayer || ""}
                onChange={(e) => setFormData((p) => ({ ...p, prayer: e.target.value }))}
                rows={2}
                maxLength={3000}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bibleIn365Days">BIBLE IN 365 DAYS (Optional)</Label>
                <Textarea
                  id="bibleIn365Days"
                  placeholder={"Job 42\nProverbs 25:1–14\nHebrews 5"}
                  value={formData.bibleIn365Days || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, bibleIn365Days: e.target.value }))}
                  rows={3}
                  maxLength={2000}
                />
                <p className="text-[10px] text-muted-foreground">Enter one reading reference per line.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="actionPoint">ACTION POINT (Optional)</Label>
                <Textarea
                  id="actionPoint"
                  placeholder="e.g. MAKE PRAYER YOUR PRIORITY AS A BELIEVER."
                  value={formData.actionPoint || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, actionPoint: e.target.value }))}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-[10px] text-muted-foreground">Practical daily spiritual takeaway for the reader.</p>
              </div>
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
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-32 rounded-xl">
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
