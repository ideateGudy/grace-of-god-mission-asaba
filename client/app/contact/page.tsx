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
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { ChurchMap } from "@/components/shared/ChurchMap";
import { useSiteConfig } from "@/lib/settings-store";

const contactSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    message: z.string().min(10, "Message is too short").max(2000),
    _honeypot: z.string().max(0),
    consent: z
      .boolean()
      .refine((value) => value, "Please agree to the privacy notice before submitting."),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
    path: ["email"],
  });

export default function ContactPage() {
  const siteConfig = useSiteConfig();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const phoneAvailable = !siteConfig.phone.startsWith("[") && Boolean(siteConfig.phone);
  const whatsappAvailable =
    !siteConfig.whatsapp.startsWith("[") && Boolean(siteConfig.whatsapp);
  const emailAvailable = !siteConfig.email.startsWith("[") && Boolean(siteConfig.email);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      _honeypot: "",
      consent: false,
    },
  });
  const consent = useWatch({ control: form.control, name: "consent" });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    if (data._honeypot) return;
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
          honeypot: data._honeypot,
        }),
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
    <PublicPageLayout
      title="Contact the Church Office"
      description="Have questions about service times, membership, or pastoral guidance? Our team in Asaba is here to assist you."
      eyebrow="Connect With Us · Support & Inquiries"
    >
      <div className="max-w-5xl mx-auto space-y-12 md:space-y-16">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard surface="strong" padding="lg" className="border border-border shadow-lg space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                We're Here for You
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Reach out to us directly through any of our official channels or visit our sanctuary
                in person.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Sanctuary Address</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {siteConfig.churchAddress.startsWith("[")
                      ? "Grace of God Mission, Asaba, Delta State, Nigeria"
                      : siteConfig.churchAddress}
                  </p>
                </div>
              </div>

              {phoneAvailable && (
                <div className="flex items-start gap-3.5">
                  <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Telephone</h3>
                    <a
                      href={siteConfig.telUrl || `tel:${siteConfig.phone}`}
                      className="text-xs text-primary font-medium hover:underline mt-0.5 block"
                    >
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>
              )}

              {whatsappAvailable && (
                <div className="flex items-start gap-3.5">
                  <FaWhatsapp className="h-5 w-5 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">WhatsApp Chat</h3>
                    <a
                      href={siteConfig.whatsAppUrl || `https://wa.me/2349075602319`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#25D366] font-medium hover:underline mt-0.5 block"
                    >
                      Chat with church greeters
                    </a>
                  </div>
                </div>
              )}

              {emailAvailable && (
                <div className="flex items-start gap-3.5">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Email Inquiries</h3>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-xs text-primary font-medium hover:underline mt-0.5 block"
                    >
                      {siteConfig.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Clock className="h-4 w-4 text-gold" />
                <span>Office & Service Hours</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sundays: Services start at 7:00 AM <br />
                Wednesdays: Midweek Encounter at 5:00 PM
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  Message Sent Successfully
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Grace of God Mission Asaba. Our church administration
                  team will review your message and reply promptly.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Send another message
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

                  <TextField
                    form={form}
                    name="name"
                    label="Your Full Name"
                    placeholder="e.g. Chukwuma Obi"
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField
                      form={form}
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="chukwuma@example.com"
                    />
                    <TextField
                      form={form}
                      name="phone"
                      label="Phone Number"
                      placeholder="+234 80..."
                    />
                  </div>

                  <TextAreaField
                    form={form}
                    name="message"
                    label="How Can We Help You?"
                    placeholder="Type your message, inquiry, or question here..."
                    rows={5}
                  />

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="contact-consent"
                      checked={consent}
                      onCheckedChange={(checked) =>
                        form.setValue("consent", checked === true, { shouldValidate: true })
                      }
                      aria-invalid={!!form.formState.errors.consent}
                    />
                    <Label
                      htmlFor="contact-consent"
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      I agree to the{" "}
                      <Link href="/privacy" className="underline hover:text-primary">
                        Privacy Notice
                      </Link>{" "}
                      and consent to being contacted by church staff regarding this inquiry.
                    </Label>
                  </div>
                  {form.formState.errors.consent && (
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors.consent.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-sm font-bold bg-primary hover:brightness-110 shadow-md transition"
                  >
                    {loading ? "Sending Message..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Embedded Interactive Map */}
      <div className="w-full">
        <ChurchMap showCardHeader className="w-full" />
      </div>
    </div>
  </PublicPageLayout>
  );
}
