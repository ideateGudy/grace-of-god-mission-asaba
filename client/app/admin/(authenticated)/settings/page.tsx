"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Building2, Landmark, Share2, Save, Loader2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/store/useSessionStore";
import { useSettingsStore } from "@/lib/settings-store";
import type { UpdateSiteSettingsDto } from "@ggm/types";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateSiteSettingsDto = {
        ...formData,
        googleMapsUrl: normalizeUrl(formData.googleMapsUrl),
        facebookUrl: normalizeUrl(formData.facebookUrl),
        tiktokUrl: normalizeUrl(formData.tiktokUrl),
        youtubeUrl: normalizeUrl(formData.youtubeUrl),
        instagramUrl: normalizeUrl(formData.instagramUrl),
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
