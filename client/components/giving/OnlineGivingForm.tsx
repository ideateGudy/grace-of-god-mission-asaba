"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, CreditCard, Lock, HeartHandshake } from "lucide-react";
import type { ProjectPublicSummary } from "@ggm/types";

const formSchema = z.object({
  amount: z.number().min(100, "Minimum donation is ₦100"),
  projectId: z.string().optional(),
  donorEmail: z.string().email("A valid email address is required for receipt"),
  donorName: z.string().optional(),
  donorPhone: z.string().optional(),
  displayName: z.string().optional(),
  isAnonymous: z.boolean(),
  message: z.string().max(500, "Note cannot exceed 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

interface OnlineGivingFormProps {
  projects?: ProjectPublicSummary[];
  defaultProjectId?: string;
}

export function OnlineGivingForm({
  projects = [],
  defaultProjectId,
}: OnlineGivingFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 5000,
      projectId: defaultProjectId || "",
      donorEmail: "",
      donorName: "",
      donorPhone: "",
      displayName: "",
      isAnonymous: true,
      message: "",
    },
  });

  const isAnonymous = form.watch("isAnonymous");
  const currentAmount = form.watch("amount");

  const handleSelectPreset = (val: number) => {
    setSelectedPreset(val);
    setCustomAmount("");
    form.setValue("amount", val, { shouldValidate: true });
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(raw);
    setSelectedPreset(null);
    const parsed = parseInt(raw, 10);
    form.setValue("amount", isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const amountKobo = Math.round(values.amount * 100);

      const res = await fetch("/api/v1/giving/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountKobo,
          projectId: values.projectId || null,
          donorEmail: values.donorEmail,
          donorName: values.donorName || null,
          donorPhone: values.donorPhone || null,
          displayName: values.displayName || null,
          isAnonymous: values.isAnonymous,
          message: values.message || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to initialize giving session");
      }

      if (json.data?.authorization_url) {
        toast.success("Connecting securely to Paystack...");
        window.location.href = json.data.authorization_url;
      } else {
        throw new Error("Missing payment checkout URL");
      }
    } catch (err: any) {
      toast.error(err.message || "Unable to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(currentAmount || 0);

  return (
    <GlassCard surface="strong" padding="lg" className="border border-border shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Secure Online Giving</span>
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground mt-1">
            Give via Paystack
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cards, Bank Transfer, USSD, and Apple Pay supported
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
          <span>256-bit Encrypted</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Giving Target (General vs Project) */}
        {projects.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="projectId" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Giving Fund or Project
            </Label>
            <select
              id="projectId"
              {...form.register("projectId")}
              className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
            >
              <option value="">General Church Giving & Kingdom Work</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Amount Presets */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Amount (NGN)
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className={`h-11 rounded-xl text-sm font-bold border transition ${
                  selectedPreset === val
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:border-gold/50"
                }`}
              >
                ₦{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
              ₦
            </span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Or enter custom amount in Naira"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="pl-8 h-11 rounded-xl font-semibold"
            />
          </div>
          {form.formState.errors.amount && (
            <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
          )}
        </div>

        {/* 3. Donor Contact Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="donorEmail" className="text-xs font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="donorEmail"
              type="email"
              placeholder="your-email@example.com"
              {...form.register("donorEmail")}
              className="h-11 rounded-xl"
            />
            {form.formState.errors.donorEmail && (
              <p className="text-xs text-destructive">{form.formState.errors.donorEmail.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="donorName" className="text-xs font-semibold">
              Full Name (Optional)
            </Label>
            <Input
              id="donorName"
              placeholder="e.g. Chukwuma Obi"
              {...form.register("donorName")}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* 4. Display & Privacy Preference */}
        <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => form.setValue("isAnonymous", checked === true)}
            />
            <Label htmlFor="isAnonymous" className="text-xs font-medium cursor-pointer">
              Give anonymously on public project donor walls
            </Label>
          </div>

          {!isAnonymous && (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="displayName" className="text-xs font-semibold">
                Public Display Name
              </Label>
              <Input
                id="displayName"
                placeholder="e.g. Brother C. Obi or Obi Family"
                {...form.register("displayName")}
                className="h-10 rounded-xl bg-card text-xs"
              />
            </div>
          )}
        </div>

        {/* 5. Optional Prayer Note / Message */}
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-xs font-semibold">
            Prayer Note / Special Dedication (Optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Write a prayer dedication, thanksgiving note, or inquiry..."
            rows={2}
            {...form.register("message")}
            className="rounded-xl text-xs"
          />
        </div>

        {/* 6. Checkout CTA Button */}
        <Button
          type="submit"
          disabled={loading || !currentAmount || currentAmount < 100}
          className="w-full h-13 rounded-xl text-base font-bold bg-primary hover:brightness-110 shadow-lg gap-2 text-white transition active:scale-98"
        >
          {loading ? (
            <span>Connecting to Paystack...</span>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Give {formattedAmount} via Paystack</span>
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Official Grace of God Mission Asaba Paystack Gateway</span>
        </div>
      </form>
    </GlassCard>
  );
}
