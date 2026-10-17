"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Building2,
  Landmark,
  Share2,
  Save,
  Loader2,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/shared/ImageUploadField";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/lib/settings-store";
import type { UpdateSiteSettingsDto, LeaderProfileDto } from "@ggm/types";

export default function SiteSettingsPage() {
  const user = useSessionStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateSiteSettingsDto>({
    churchName: "Grace of God Mission Asaba",
    phone: "",
    email: "",
    address: "",
    whatsapp: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    googleMapsUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    instagramUrl: "",
    leadership: [],
  });

  useEffect(() => {
    let cancelled = false;
    api.settings
      .get()
      .then(({ data }) => {
        if (!cancelled && data) {
          setFormData({
            churchName: data.churchName || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            whatsapp: data.whatsapp || "",
            bankName: data.bankName || "",
            accountName: data.accountName || "",
            accountNumber: data.accountNumber || "",
            googleMapsUrl: data.googleMapsUrl || "",
            facebookUrl: data.facebookUrl || "",
            tiktokUrl: data.tiktokUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            instagramUrl: data.instagramUrl || "",
            leadership: Array.isArray(data.leadership) ? data.leadership : [],
          });
        }
      })
      .catch(() => toast.error("Unable to load site settings."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizeUrl = (val: string | null | undefined): string => {
    if (!val) return "";
    const trimmed = val.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleUrlBlur = (field: keyof UpdateSiteSettingsDto) => {
    const raw = formData[field];
    if (typeof raw === "string") {
      const normalized = normalizeUrl(raw);
      if (normalized !== raw) {
        setFormData((prev) => ({ ...prev, [field]: normalized }));
      }
    }
  };

  if (user && user.role !== "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Site Settings"
          description="Manage general church information and configurations."
        />
        <GlassCard surface="solid" padding="lg" className="max-w-xl text-center py-12">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Only Super Administrators have permission to modify live church settings and bank accounts.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handleAddLeader = () => {
    setFormData((prev) => ({
      ...prev,
      leadership: [
        ...(prev.leadership || []),
        {
          name: "",
          title: "",
          bio: "",
          imageUrl: "",
        },
      ],
    }));
  };

  const handleRemoveLeader = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      leadership: (prev.leadership || []).filter((_, i) => i !== index),
    }));
  };

  const handleMoveLeader = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const list = [...(prev.leadership || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, leadership: list };
    });
  };

  const handleLeaderChange = (
    index: number,
    field: keyof LeaderProfileDto,
    value: string
  ) => {
    setFormData((prev) => {
      const list = [...(prev.leadership || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, leadership: list };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentLeaders = formData.leadership || [];
      for (let i = 0; i < currentLeaders.length; i++) {
        const item = currentLeaders[i];
        if (!item.name?.trim()) {
          toast.error(`Pastoral Leader #${i + 1} requires a name.`);
          setSaving(false);
          return;
        }
        if (!item.title?.trim()) {
          toast.error(`Pastoral Leader #${i + 1} requires a title or role.`);
          setSaving(false);
          return;
        }
      }

      const payload: UpdateSiteSettingsDto = {
        ...formData,
        googleMapsUrl: normalizeUrl(formData.googleMapsUrl),
        facebookUrl: normalizeUrl(formData.facebookUrl),
        tiktokUrl: normalizeUrl(formData.tiktokUrl),
        youtubeUrl: normalizeUrl(formData.youtubeUrl),
        instagramUrl: normalizeUrl(formData.instagramUrl),
        leadership: currentLeaders.map((leader) => ({
          name: leader.name.trim(),
          title: leader.title.trim(),
          bio: leader.bio?.trim() || "",
          imageUrl: normalizeUrl(leader.imageUrl),
        })),
      };
      const res = await api.settings.update(payload);
      if (res?.data) {
        useSettingsStore.getState().setSettings(res.data);
      }
      toast.success("Site settings updated successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update site settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateSiteSettingsDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Site Settings"
          description="Manage church contact information, banking details, and social profiles."
        />
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Site Settings"
        description="Update church details, giving accounts, and links displayed across the public website without needing code changes."
      />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Church & Contact Information */}
        <GlassCard surface="solid" padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">General & Contact Details</h2>
              <p className="text-xs text-muted-foreground">
                Primary contact numbers and office location for Asaba parish.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="churchName">Church Name</Label>
              <Input
                id="churchName"
                value={formData.churchName}
                onChange={(e) => handleChange("churchName", e.target.value)}
                required
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Official Telephone</Label>
              <Input
                id="phone"
                placeholder="+234 803 000 0000"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
                maxLength={40}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                placeholder="+234 803 000 0000"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                required
                maxLength={40}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Office Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="office@graceofgodmissionasaba.org"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input
                id="address"
                placeholder="No. 33 Arthur Richard Street, Akwuebulu, Asaba"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="googleMapsUrl">Google Maps Directions URL</Label>
              <Input
                id="googleMapsUrl"
                type="text"
                inputMode="url"
                placeholder="e.g. google.com/maps/place/... or https://maps.google.com/..."
                value={formData.googleMapsUrl || ""}
                onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                onBlur={() => handleUrlBlur("googleMapsUrl")}
              />
            </div>
          </div>
        </GlassCard>

        {/* Financial & Banking Information */}
        <GlassCard surface="solid" padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Banking Details for Giving</h2>
              <p className="text-xs text-muted-foreground">
                Displayed on the Giving page for bank transfers and donations.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong className="font-semibold">Financial Integrity Notice:</strong> Any changes made to these bank accounts take effect immediately across all public giving channels (e.g. <span className="font-mono">/give</span>) and are permanently recorded in the immutable administrative audit log.
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="e.g. Zenith Bank"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g. Grace of God Mission Asaba"
                value={formData.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="e.g. 1214552398"
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
                required
                maxLength={40}
              />
            </div>
          </div>
        </GlassCard>

        {/* Social Media Links */}
        <GlassCard surface="solid" padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo/10 text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Social Media Channels</h2>
              <p className="text-xs text-muted-foreground">
                Official handles linked in the footer and communication channels.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                type="text"
                inputMode="url"
                placeholder="e.g. facebook.com/... or https://..."
                value={formData.facebookUrl || ""}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                onBlur={() => handleUrlBlur("facebookUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktokUrl">TikTok URL</Label>
              <Input
                id="tiktokUrl"
                type="text"
                inputMode="url"
                placeholder="e.g. tiktok.com/@... or https://..."
                value={formData.tiktokUrl || ""}
                onChange={(e) => handleChange("tiktokUrl", e.target.value)}
                onBlur={() => handleUrlBlur("tiktokUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL (Optional)</Label>
              <Input
                id="youtubeUrl"
                type="text"
                inputMode="url"
                placeholder="e.g. youtube.com/... or https://..."
                value={formData.youtubeUrl || ""}
                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                onBlur={() => handleUrlBlur("youtubeUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL (Optional)</Label>
              <Input
                id="instagramUrl"
                type="text"
                inputMode="url"
                placeholder="e.g. instagram.com/... or https://..."
                value={formData.instagramUrl || ""}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                onBlur={() => handleUrlBlur("instagramUrl")}
              />
            </div>
          </div>
        </GlassCard>

        {/* Pastoral Leadership Profiles */}
        <GlassCard surface="solid" padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Pastoral Leadership Profiles</h2>
                <p className="text-xs text-muted-foreground">
                  Pastors and leaders featured publicly on the About Us page.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLeader}
              className="flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Leader Profile</span>
            </Button>
          </div>

          {(!formData.leadership || formData.leadership.length === 0) ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">No pastoral profiles added yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Profiles added here will automatically appear on the public About page with their photo, role, and bio.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddLeader}
                className="mt-4 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Leader</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.leadership.map((leader, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card/60 p-5 shadow-xs space-y-4 transition hover:border-primary/30"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Leader #{index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={index === 0}
                        onClick={() => handleMoveLeader(index, "up")}
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span className="sr-only">Move Up</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        disabled={index === (formData.leadership?.length ?? 0) - 1}
                        onClick={() => handleMoveLeader(index, "down")}
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span className="sr-only">Move Down</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveLeader(index)}
                        title="Remove Leader"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Remove Leader</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`leader-name-${index}`}>Full Name & Title Prefix *</Label>
                      <Input
                        id={`leader-name-${index}`}
                        placeholder="e.g. Rev. Dr. Emmah Isong / Pastor John Okonkwo"
                        value={leader.name}
                        onChange={(e) => handleLeaderChange(index, "name", e.target.value)}
                        required
                        maxLength={120}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`leader-title-${index}`}>Ministry Role / Title *</Label>
                      <Input
                        id={`leader-title-${index}`}
                        placeholder="e.g. Senior Pastor / Resident Pastor / Associate Pastor"
                        value={leader.title}
                        onChange={(e) => handleLeaderChange(index, "title", e.target.value)}
                        required
                        maxLength={120}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`leader-bio-${index}`}>Brief Biography or Profile</Label>
                      <Textarea
                        id={`leader-bio-${index}`}
                        placeholder="Write a brief pastoral profile, ministry calling, or summary..."
                        value={leader.bio || ""}
                        onChange={(e) => handleLeaderChange(index, "bio", e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="resize-none"
                      />
                      <p className="text-[11px] text-muted-foreground text-right">
                        {(leader.bio || "").length}/1000 characters
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <ImageUploadField
                        label="Leader Profile Photo"
                        value={leader.imageUrl || ""}
                        onChange={(url) => handleLeaderChange(index, "imageUrl", url)}
                        scope="gallery"
                        id={`leader-photo-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} className="min-w-36 h-11">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
