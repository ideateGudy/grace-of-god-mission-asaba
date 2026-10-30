"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Sparkles, Loader2, Send } from "lucide-react";

export function TestimonyDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorName: "",
    phone: "",
    email: "",
    isAnonymous: false,
    consent: false,
    ageConfirmation: false,
    _honeypot: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData._honeypot) return;

    if (!formData.title.trim()) {
      toast.error("Please enter a title for your testimony.");
      return;
    }
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      toast.error("Please write a few sentences about what the Lord did for you.");
      return;
    }
    if (!formData.authorName.trim()) {
      toast.error("Please enter your name (you can check 'Keep my name anonymous' below).");
      return;
    }
    if (!formData.consent) {
      toast.error("Please agree to the privacy notice before submitting.");
      return;
    }
    if (!formData.ageConfirmation) {
      toast.error("Please confirm you are at least 18 or submitting with parental consent.");
      return;
    }

    setSubmitting(true);
    try {
      await api.testimonies.submit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        authorName: formData.authorName.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        isAnonymous: formData.isAnonymous,
        honeypot: formData._honeypot,
      });

      toast.success("Hallelujah! Your testimony has been received.", {
        description: "It has been submitted for pastoral review and will appear on the wall soon.",
      });

      setFormData({
        title: "",
        content: "",
        authorName: "",
        phone: "",
        email: "",
        isAnonymous: false,
        consent: false,
        ageConfirmation: false,
        _honeypot: "",
      });
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit testimony. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="rounded-xl flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Share Your Testimony</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Praise Report</span>
          </div>
          <DialogTitle className="font-display text-2xl font-bold">
            Tell What The Lord Has Done
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            "And they overcame him by the blood of the Lamb, and by the word of their testimony." — Revelation 12:11
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Honeypot anti-spam */}
          <input
            type="text"
            className="hidden"
            tabIndex={-1}
            value={formData._honeypot}
            onChange={(e) => setFormData((p) => ({ ...p, _honeypot: e.target.value }))}
          />

          <div className="space-y-1.5">
            <Label htmlFor="testimony-title">Testimony Title *</Label>
            <Input
              id="testimony-title"
              placeholder="e.g. Miraculous Healing of Chronic Pain / Divine Job Provision"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              required
              maxLength={160}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="testimony-content">Your Testimony Story *</Label>
            <Textarea
              id="testimony-content"
              placeholder="Share the details of your encounter, what God did, and give Him praise..."
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              rows={5}
              required
              maxLength={5000}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="testimony-author">Your Name *</Label>
              <Input
                id="testimony-author"
                placeholder="e.g. Brother Emmanuel"
                value={formData.authorName}
                onChange={(e) => setFormData((p) => ({ ...p, authorName: e.target.value }))}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="testimony-phone">Phone Number (Optional)</Label>
              <Input
                id="testimony-phone"
                placeholder="+234 803 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                maxLength={40}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="testimony-email">Email Address (Optional)</Label>
            <Input
              id="testimony-email"
              type="email"
              placeholder="emmanuel@example.com"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3">
            <Checkbox
              id="anonymous-toggle"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) =>
                setFormData((p) => ({ ...p, isAnonymous: checked === true }))
              }
            />
            <Label
              htmlFor="anonymous-toggle"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
            >
              <strong className="text-foreground">Keep my name anonymous:</strong> Your testimony will be published as &quot;Church Member&quot;, keeping your personal identity private.
            </Label>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id="testimony-consent"
                checked={formData.consent}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, consent: checked === true }))
                }
              />
              <Label
                htmlFor="testimony-consent"
                className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
              >
                I agree to the{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                  Privacy Notice
                </Link>{" "}
                and consent to pastoral review and publication of this testimony.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="testimony-age"
                checked={formData.ageConfirmation}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, ageConfirmation: checked === true }))
                }
              />
              <Label
                htmlFor="testimony-age"
                className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
              >
                I confirm that I am 18 years or older, or submitting with the consent of a parent/guardian (NDPA s.31).
              </Label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-32">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Testimony
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
