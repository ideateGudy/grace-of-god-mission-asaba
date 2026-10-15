"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField, TextAreaField } from "@/components/shared/FormFields";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileNav } from "@/components/layout/MobileNav";
import { Section, SectionHeading } from "@/components/shared/Section";
import { GlassCard } from "@/components/shared/GlassCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Lock } from "lucide-react";

const prayerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  request: z.string().min(10, "Request is too short").max(2000),
  _honeypot: z.string().max(0),
  consent: z.boolean().refine((value) => value, "Please agree to the privacy notice before submitting.")
});

export default function PrayerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof prayerSchema>>({
    resolver: zodResolver(prayerSchema),
    defaultValues: { name: "", email: "", phone: "", request: "", _honeypot: "", consent: false }
  });
  const consent = useWatch({ control: form.control, name: "consent" });

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
          consent: data.consent,
          honeypot: data._honeypot
        })
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
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <MobileNav />
      <main className="flex-1 pt-24 pb-16" id="main-content">
        <Section>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <SectionHeading>Prayer Request</SectionHeading>
              <p className="text-lg text-muted-foreground text-balance">
                &ldquo;Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.&rdquo; — Philippians 4:6
              </p>
            </div>
            
            <GlassCard surface="strong" padding="lg">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-medium text-foreground mb-2">Request Submitted</h3>
                  <p className="text-muted-foreground mb-6">Our prayer team will be praying for you. God bless you.</p>
                  <Button onClick={() => setSuccess(false)} variant="outline">Submit another request</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TextField form={form} name="_honeypot" label="" className="hidden" aria-hidden="true" tabIndex={-1} />
                    
                    <TextAreaField form={form} name="request" label="Your Prayer Request" placeholder="Share your prayer request..." rows={6} />
                    
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium mb-4 text-muted-foreground">Optional Details</p>
                      <TextField form={form} name="name" label="Name (Optional)" placeholder="John Doe" />
                      <div className="grid sm:grid-cols-2 gap-6 mt-6">
                        <TextField form={form} name="email" label="Email (Optional)" type="email" />
                        <TextField form={form} name="phone" label="Phone (Optional)" />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-md border border-border bg-muted/50 p-4">
                      <Checkbox id="keep-private" checked disabled aria-label="Prayer requests are private to the prayer team" />
                      <Label htmlFor="keep-private" className="flex items-center gap-2 text-sm"><Lock className="w-4 h-4 shrink-0 text-primary" />Kept private to the prayer team</Label>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox id="prayer-consent" checked={consent} onCheckedChange={(checked) => form.setValue("consent", checked === true, { shouldValidate: true })} aria-invalid={!!form.formState.errors.consent} />
                      <Label htmlFor="prayer-consent" className="text-sm leading-relaxed">I agree to the <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link> and the prayer team using this request to respond.</Label>
                    </div>
                    {form.formState.errors.consent && <p role="alert" className="text-sm text-destructive">{form.formState.errors.consent.message}</p>}
                    
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-full text-base">
                      {loading ? "Submitting..." : "Submit Prayer Request"}
                    </Button>
                  </form>
                </Form>
              )}
            </GlassCard>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
