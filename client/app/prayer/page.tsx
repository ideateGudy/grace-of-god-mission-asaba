"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField, TextAreaField } from "@/components/shared/FormFields";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Lock,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
} from "lucide-react";

const prayerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  request: z.string().min(10, "Request is too short").max(2000),
  shareOnWall: z.boolean(),
  _honeypot: z.string().max(0),
  consent: z
    .boolean()
    .refine((value) => value, "Please agree to the privacy notice before submitting."),
  ageConfirmation: z
    .boolean()
    .refine((value) => value, "Please confirm you are at least 18 or submitting with parental consent."),
});

export default function PrayerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof prayerSchema>>({
    resolver: zodResolver(prayerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      request: "",
      shareOnWall: false,
      _honeypot: "",
      consent: false,
      ageConfirmation: false,
    },
  });
  const consent = useWatch({ control: form.control, name: "consent" });
  const ageConfirmation = useWatch({ control: form.control, name: "ageConfirmation" });

  const onSubmit = async (data: z.infer<typeof prayerSchema>) => {
    if (data._honeypot) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          request: data.request,
          shareOnWall: data.shareOnWall,
          consent: data.consent,
          honeypot: data._honeypot,
        }),
      });

      if (res.status === 429) {
        toast.error("You are sending requests too quickly. Please wait a bit.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to send request");

      setSuccess(true);
      form.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicPageLayout
      title="How Can We Pray For You?"
      description="No burden is meant to be carried alone. Our pastoral team and intercessory prayer warriors stand ready to agree with you in prayer."
      eyebrow="Intercession · Confidential Prayer"
    >
      <div className="grid gap-10 lg:grid-cols-12 max-w-5xl mx-auto">
        {/* Left Column: Reassurance & Scripture */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard
            surface="strong"
            padding="lg"
            className="border border-border shadow-lg space-y-5 bg-gradient-to-br from-primary/10 via-card to-card"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <HeartHandshake className="h-6 w-6" aria-hidden="true" />
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground">
              We Believe in the Power of Prayer
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Whatever season of life you are currently navigating — whether health, family,
              spiritual guidance, or breakthrough — God hears the cries of His children.
            </p>

            <div className="rounded-xl border border-border/80 bg-background/80 p-4 text-xs italic text-muted-foreground leading-relaxed">
              “Be anxious for nothing, but in everything by prayer and supplication, with
              thanksgiving, let your requests be made known to God; and the peace of God, which
              surpasseth all understanding, shall keep your hearts and minds.”
              <span className="block mt-1 font-semibold not-italic text-primary">
                — Philippians 4:6-7
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-foreground">100% Confidential</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Only read by dedicated pastoral intercessors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Prayed over during weekly prayer watches</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            surface="solid"
            padding="md"
            className="border border-primary/20 bg-primary/5 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Community Intercession</span>
            </div>
            <h4 className="font-display text-base font-bold text-foreground">
              Visit the Prayer Wall
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stand in faith with other church members and pray over petitions posted by brethren.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl">
              <Link href="/prayer/wall">Go to Prayer Wall →</Link>
            </Button>
          </GlassCard>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  Prayer Request Received
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Our pastoral intercessory team has received your request and will be lifting you
                  before the throne of grace. May the Lord grant you peace and divine intervention.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="rounded-xl w-full sm:w-auto"
                  >
                    Submit another request
                  </Button>
                  <Button asChild className="rounded-xl w-full sm:w-auto">
                    <Link href="/prayer/wall">View Community Prayer Wall</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TextField
                    form={form}
                    name="_honeypot"
                    label=""
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                  />

                  <TextAreaField
                    form={form}
                    name="request"
                    label="Your Prayer Request"
                    placeholder="Share what is on your heart... (e.g. healing for my mother, wisdom for career, spiritual revival)"
                    rows={6}
                  />

                  <div className="pt-4 border-t border-border/80">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                      Optional Contact Details
                    </p>
                    <TextField
                      form={form}
                      name="name"
                      label="Your Name (Optional)"
                      placeholder="e.g. Brother John"
                    />
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <TextField
                        form={form}
                        name="email"
                        label="Email (Optional)"
                        type="email"
                        placeholder="john@example.com"
                      />
                      <TextField
                        form={form}
                        name="phone"
                        label="Phone (Optional)"
                        placeholder="+234 80..."
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5">
                    <Checkbox
                      id="keep-private"
                      checked
                      disabled
                      aria-label="Prayer requests are strictly private to the prayer team"
                    />
                    <Label
                      htmlFor="keep-private"
                      className="flex items-center gap-2 text-xs text-muted-foreground cursor-default"
                    >
                      <Lock className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>
                        Kept strictly private and confidential to pastoral intercessors
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-3.5">
                    <Checkbox
                      id="share-wall"
                      checked={form.watch("shareOnWall")}
                      onCheckedChange={(checked) =>
                        form.setValue("shareOnWall", checked === true)
                      }
                    />
                    <Label
                      htmlFor="share-wall"
                      className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
                    >
                      <strong className="text-foreground font-semibold">Share on the Community Prayer Wall:</strong>{" "}
                      Allow the church family to agree with you in prayer. Your name, email, and phone number are{" "}
                      <span className="font-bold underline text-foreground">strictly anonymous</span> and will never be shown.
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="prayer-consent"
                        checked={consent}
                        onCheckedChange={(checked) =>
                          form.setValue("consent", checked === true, { shouldValidate: true })
                        }
                        aria-invalid={!!form.formState.errors.consent}
                      />
                      <Label
                        htmlFor="prayer-consent"
                        className="text-xs leading-relaxed text-muted-foreground"
                      >
                        I agree to the{" "}
                        <Link href="/privacy" className="underline hover:text-primary">
                          Privacy Notice
                        </Link>{" "}
                        and consent to the pastoral prayer team receiving this request.
                      </Label>
                    </div>
                    {form.formState.errors.consent && (
                      <p role="alert" className="text-xs text-destructive">
                        {form.formState.errors.consent.message}
                      </p>
                    )}

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="prayer-age"
                        checked={ageConfirmation}
                        onCheckedChange={(checked) =>
                          form.setValue("ageConfirmation", checked === true, { shouldValidate: true })
                        }
                        aria-invalid={!!form.formState.errors.ageConfirmation}
                      />
                      <Label
                        htmlFor="prayer-age"
                        className="text-xs leading-relaxed text-muted-foreground"
                      >
                        I confirm that I am 18 years or older, or submitting with the consent of a parent/guardian (NDPA s.31).
                      </Label>
                    </div>
                    {form.formState.errors.ageConfirmation && (
                      <p role="alert" className="text-xs text-destructive">
                        {form.formState.errors.ageConfirmation.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:brightness-110 shadow-md transition"
                  >
                    {loading ? "Submitting..." : "Submit Prayer Request"}
                  </Button>
                </form>
              </Form>
            )}
          </GlassCard>
        </div>
      </div>
    </PublicPageLayout>
  );
}
