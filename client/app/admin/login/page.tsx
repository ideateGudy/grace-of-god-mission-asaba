"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/shared/FormFields";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { Logo } from "@/components/shared/Logo";
import { api, ApiError } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before attempting to sign in.`);
      return;
    }
    setLoading(true);
    try {
      const response = await api.auth.login(data);
      const user = response.data;
      setUser(user as Parameters<typeof setUser>[0]);
      toast.success("Signed in successfully.");
      if (user.mustChangePassword) {
        router.push("/admin/account");
      } else {
        router.push("/admin");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setCooldown(60);
        toast.error("Too many login attempts. Please wait 60 seconds before trying again.");
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-midnight/25 via-background to-indigo/25 pointer-events-none" />
      <div className="mb-8 relative z-10"><Logo size="lg" /></div>
      <GlassCard surface="strong" padding="lg" className="w-full max-w-md relative z-10 border border-border shadow-xl">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-display font-semibold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground">Admin portal for Grace of God Mission Asaba</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TextField form={form} name="email" label="Email Address" type="email" placeholder="admin@example.com" />
            <TextField form={form} name="password" label="Password" type="password" />

            {cooldown > 0 && (
              <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                <p className="font-semibold">Too many failed login attempts</p>
                <p>For security, sign in is temporarily locked. Please retry in {cooldown} seconds.</p>
              </div>
            )}

            <Button type="submit" className="w-full min-h-11 font-medium" disabled={loading || cooldown > 0}>
              {loading ? "Signing in..." : cooldown > 0 ? `Rate limited (${cooldown}s)` : "Sign In"}
            </Button>
          </form>
        </Form>
      </GlassCard>
    </div>
  );
}
