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
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  message: z.string().min(10, "Message is too short").max(2000),
  _honeypot: z.string().max(0), // must be empty
  consent: z.boolean().refine((value) => value, "Please agree to the privacy notice before submitting.")
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"]
});

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "", _honeypot: "", consent: false }
  });
  const consent = useWatch({ control: form.control, name: "consent" });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    if (data._honeypot) return; // bot
    setLoading(true);
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          message: data.message,
          consent: data.consent,
          honeypot: data._honeypot
        })
      });
      
      if (res.status === 429) {
        toast.error("You are sending messages too quickly. Please wait a bit.");
        setLoading(false);
        return;
      }
      
      if (!res.ok) throw new Error("Failed to send message");
      
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
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <SectionHeading>Contact Us</SectionHeading>
              <p className="text-lg text-muted-foreground mb-8">
                We&apos;d love to hear from you. Whether you have a question about our services, need prayer, or just want to connect, our team is here for you.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Address</h3>
                    <p className="text-muted-foreground mt-1">{siteConfig.churchAddress}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-muted-foreground mt-1">{siteConfig.phone}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground mt-1">{siteConfig.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <GlassCard surface="strong" padding="lg">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-display font-medium text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                  <Button onClick={() => setSuccess(false)} variant="outline">Send another message</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <TextField form={form} name="_honeypot" label="" className="hidden" aria-hidden="true" tabIndex={-1} />
                    <TextField form={form} name="name" label="Your Name" placeholder="John Doe" />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <TextField form={form} name="email" label="Email Address" type="email" placeholder="john@example.com" />
                      <TextField form={form} name="phone" label="Phone Number" placeholder="+234 80..." />
                    </div>
                    <TextAreaField form={form} name="message" label="Message" placeholder="How can we help you?" rows={5} />
                    
                    <div className="flex items-start gap-3">
                      <Checkbox id="contact-consent" checked={consent} onCheckedChange={(checked) => form.setValue("consent", checked === true, { shouldValidate: true })} aria-invalid={!!form.formState.errors.consent} />
                      <Label htmlFor="contact-consent" className="text-sm leading-relaxed">I agree to the <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link> and consent to being contacted about this message.</Label>
                    </div>
                    {form.formState.errors.consent && <p role="alert" className="text-sm text-destructive">{form.formState.errors.consent.message}</p>}
                    
                    <Button type="submit" disabled={loading} className="w-full h-12 rounded-full text-base">
                      {loading ? "Sending..." : "Send Message"}
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
