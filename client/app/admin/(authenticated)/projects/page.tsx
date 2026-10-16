"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  HeartHandshake, 
  FolderKanban, 
  Target, 
  TrendingUp, 
  Layers
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { authFetch } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePermissions } from "@/components/shared/Can";
import { api } from "@/lib/api/client";
import type { ProjectPublicSummary } from "@ggm/types";

function formatNairaFromKobo(koboStr: string | number): string {
  const kobo = typeof koboStr === "string" ? BigInt(koboStr) : BigInt(Math.floor(koboStr));
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}

export default function AdminProjectsPage() {
  const { can } = usePermissions();
  const allowed = can("PROJECTS_MANAGE");

  const [projects, setProjects] = useState<ProjectPublicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectPublicSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formGoalNaira, setFormGoalNaira] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"DRAFT" | "ACTIVE" | "COMPLETED">("DRAFT");
  const [formDeadline, setFormDeadline] = useState("");

  // Record Offline Gift modal state
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftProject, setGiftProject] = useState<ProjectPublicSummary | null>(null);
  const [giftSaving, setGiftSaving] = useState(false);
  const [giftAmountNaira, setGiftAmountNaira] = useState("");
  const [giftDonorName, setGiftDonorName] = useState("");
  const [giftDonorPhone, setGiftDonorPhone] = useState("");
  const [giftDisplayName, setGiftDisplayName] = useState("");
  const [giftIsAnonymous, setGiftIsAnonymous] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  // Delete modal state
  const [pendingDelete, setPendingDelete] = useState<ProjectPublicSummary | null>(null);

  const load = useCallback(async () => {
    if (!allowed) {
      setProjects([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.admin.list<ProjectPublicSummary>("projects", "?limit=50");
      setProjects(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormSlug("");
    setFormGoalNaira("");
    setFormDescription("");
    setFormImageUrl("");
    setFormStatus("DRAFT");
    setFormDeadline("");
    setIsEditorOpen(true);
  };

  const openEditModal = (p: ProjectPublicSummary) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormGoalNaira((Number(p.goalKobo) / 100).toString());
    setFormDescription(p.description);
    setFormImageUrl(p.imageUrl || "");
    setFormStatus(p.status);
    setFormDeadline(p.deadline ? p.deadline.slice(0, 10) : "");
    setIsEditorOpen(true);
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const nairaNum = parseFloat(formGoalNaira);
      if (isNaN(nairaNum) || nairaNum <= 0) {
        throw new Error("Please specify a valid fundraising goal in Naira");
      }
      const goalKobo = Math.round(nairaNum * 100);

      const payload: any = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        goalKobo,
        status: formStatus,
        imageUrl: formImageUrl.trim() || null,
        deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
      };
      if (formSlug.trim()) {
        payload.slug = formSlug.trim();
      }

      if (editingProject) {
        await api.admin.update("projects", editingProject.id, payload);
        toast.success("Project updated successfully");
      } else {
        await api.admin.create("projects", payload);
        toast.success("Project created successfully");
      }
      setIsEditorOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const openRecordGiftModal = (p: ProjectPublicSummary) => {
    setGiftProject(p);
    setGiftAmountNaira("");
    setGiftDonorName("");
    setGiftDonorPhone("");
    setGiftDisplayName("");
    setGiftIsAnonymous(false);
    setGiftMessage("");
    setIsGiftModalOpen(true);
  };

  const handleRecordOfflineGift = async (e: FormEvent) => {
    e.preventDefault();
    if (!giftProject) return;
    setGiftSaving(true);
    try {
      const nairaNum = parseFloat(giftAmountNaira);
      if (isNaN(nairaNum) || nairaNum <= 0) {
        throw new Error("Please enter a valid gift amount in Naira");
      }
      const amountKobo = Math.round(nairaNum * 100);

      const res = await authFetch(`/api/v1/admin/projects/${giftProject.id}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountKobo,
          donorName: giftDonorName.trim() || undefined,
          donorPhone: giftDonorPhone.trim() || undefined,
          displayName: giftDisplayName.trim() || (giftIsAnonymous ? "Anonymous Supporter" : giftDonorName.trim() || "Generous Giver"),
          isAnonymous: giftIsAnonymous,
          message: giftMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to record gift");
      }

      toast.success(`Successfully recorded offline gift of ₦${nairaNum.toLocaleString()}!`);
      setIsGiftModalOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Error recording offline contribution");
    } finally {
      setGiftSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api.admin.remove("projects", pendingDelete.id);
      toast.success("Project deleted successfully");
      setPendingDelete(null);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Could not delete project");
    }
  };

  if (!allowed) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        You do not have permission to manage church projects.
      </div>
    );
  }

  // Quick stats calculations
  const totalGoalBigInt = projects.reduce((acc, p) => acc + BigInt(p.goalKobo || 0), BigInt(0));
  const totalRaisedBigInt = projects.reduce((acc, p) => acc + BigInt(p.raisedKobo || 0), BigInt(0));
  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Church Projects"
          description="Manage building projects, mission outreaches, and track transparent giving progress."
        />
        <Button onClick={openCreateModal} className="shrink-0 self-start sm:self-auto gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Projects</p>
            <p className="text-2xl font-bold font-display">{projects.length}</p>
          </div>
        </GlassCard>

        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Active Campaigns</p>
            <p className="text-2xl font-bold font-display">{activeCount}</p>
          </div>
        </GlassCard>

        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Combined Goal</p>
            <p className="text-lg font-bold font-display">{formatNairaFromKobo(totalGoalBigInt.toString())}</p>
          </div>
        </GlassCard>

        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Raised</p>
            <p className="text-lg font-bold font-display text-primary">{formatNairaFromKobo(totalRaisedBigInt.toString())}</p>
          </div>
        </GlassCard>
      </div>

      {/* Projects Feed */}
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading church projects…</div>
      ) : projects.length === 0 ? (
        <GlassCard surface="solid" padding="lg" className="text-center py-16">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-lg">No Projects Created Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            Create your first church project campaign to display it on the public site and start receiving targeted gifts.
          </p>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => {
            const pct = Math.min(100, Math.round((Number(p.raisedKobo) / Number(p.goalKobo || 1)) * 100));
            return (
              <GlassCard key={p.id} surface="solid" padding="md" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {p.imageUrl ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg shrink-0 border border-border bg-muted flex items-center justify-center text-muted-foreground">
                      <FolderKanban className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base truncate">{p.title}</h3>
                      <Badge
                        variant={p.status === "ACTIVE" ? "default" : p.status === "COMPLETED" ? "secondary" : "outline"}
                        className={
                          p.status === "ACTIVE"
                            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                            : p.status === "COMPLETED"
                            ? "bg-blue-600 hover:bg-blue-600 text-white"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">/{p.slug}</span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>

                    <div className="pt-2 max-w-md">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-foreground">
                          {formatNairaFromKobo(p.raisedKobo)}{" "}
                          <span className="font-normal text-muted-foreground">raised of {formatNairaFromKobo(p.goalKobo)}</span>
                        </span>
                        <span className="font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span>{p.contributionsCount || 0} contributions</span>
                        {p.deadline && (
                          <span>· Target: {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(p.deadline))}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    onClick={() => openRecordGiftModal(p)}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    Record Gift
                  </Button>

                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEditModal(p)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>

                  <Link href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost" className="gap-1 px-2.5" title="View Public Page">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 px-2.5"
                    onClick={() => setPendingDelete(p)}
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Church Project" : "Create New Church Project"}</DialogTitle>
            <DialogDescription>
              Set campaign details, targets, and media to showcase to members and supporters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProject} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="proj-title">Project Title *</Label>
              <Input
                id="proj-title"
                required
                maxLength={160}
                placeholder="e.g. Asaba Cathedral Expansion Phase 1"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proj-slug">URL Slug</Label>
                <Input
                  id="proj-slug"
                  maxLength={180}
                  placeholder="e.g. cathedral-expansion"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
                <p className="text-xs text-muted-foreground">Auto-generated from title if left empty.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-goal">Fundraising Goal (₦ Naira) *</Label>
                <Input
                  id="proj-goal"
                  required
                  type="number"
                  min="1000"
                  step="1000"
                  placeholder="e.g. 15000000"
                  value={formGoalNaira}
                  onChange={(e) => setFormGoalNaira(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {formGoalNaira ? `Formatted: ₦${Number(formGoalNaira || 0).toLocaleString()}` : "Enter amount in Naira"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proj-status">Campaign Status</Label>
                <Select value={formStatus} onValueChange={(val: any) => setFormStatus(val)}>
                  <SelectTrigger id="proj-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">DRAFT (Hidden from Public)</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE (Open for Giving)</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED (Goal Achieved)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-deadline">Target Completion Date (Optional)</Label>
                <Input
                  id="proj-deadline"
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proj-image">Cover Image URL (Optional)</Label>
              <Input
                id="proj-image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proj-desc">Project Description & Vision *</Label>
              <Textarea
                id="proj-desc"
                required
                rows={5}
                placeholder="Describe why this project matters, what it accomplishes, and how it glorifies God..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Offline Gift Modal */}
      <Dialog open={isGiftModalOpen} onOpenChange={setIsGiftModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Offline Gift</DialogTitle>
            <DialogDescription>
              Record cash, direct bank deposit, cheque, or POS gifts given offline towards{" "}
              <strong className="text-foreground">{giftProject?.title}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordOfflineGift} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="gift-amount">Gift Amount (₦ Naira) *</Label>
              <Input
                id="gift-amount"
                required
                type="number"
                min="100"
                step="100"
                placeholder="e.g. 50000"
                value={giftAmountNaira}
                onChange={(e) => setGiftAmountNaira(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {giftAmountNaira ? `Recorded as: ₦${Number(giftAmountNaira || 0).toLocaleString()}` : "Enter amount in Naira"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gift-name">Donor Full Name</Label>
                <Input
                  id="gift-name"
                  placeholder="e.g. Bro. Emmanuel Okafor"
                  value={giftDonorName}
                  onChange={(e) => setGiftDonorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gift-phone">Donor Phone</Label>
                <Input
                  id="gift-phone"
                  placeholder="e.g. 08012345678"
                  value={giftDonorPhone}
                  onChange={(e) => setGiftDonorPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gift-display">Display Name on Supporters Feed</Label>
              <Input
                id="gift-display"
                placeholder="Defaults to donor name or 'Anonymous Supporter'"
                value={giftDisplayName}
                onChange={(e) => setGiftDisplayName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="gift-anon"
                checked={giftIsAnonymous}
                onCheckedChange={(c) => setGiftIsAnonymous(!!c)}
              />
              <Label htmlFor="gift-anon" className="text-sm font-normal cursor-pointer">
                Keep this gift completely anonymous on the public feed
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gift-note">Donor Note / Cheque No. / Reference</Label>
              <Textarea
                id="gift-note"
                rows={2}
                placeholder="Optional memo, teller reference, or prayer note"
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsGiftModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={giftSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <HeartHandshake className="w-4 h-4" />
                {giftSaving ? "Recording…" : "Save Offline Gift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This will permanently delete this project. Any contributions already tied to it will remain in financial audit logs but detached from this project."
        confirmText="Delete Project"
        onConfirm={handleDelete}
        isDestructive
      />
    </div>
  );
}
