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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/shared/GlassCard";
import { Logo } from "@/components/shared/Logo";
import { api, ApiError } from "@/lib/api/client";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

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
    defaultValues: { email: "", password: "" },
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

      if (user.requires2FA) {
        setPendingCredentials(data);
        setStep("2fa");
        toast.info("Please enter your two-factor verification code.");
        return;
      }

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

  const on2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCredentials) return;
    if (twoFactorCode.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.auth.login({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        twoFactorCode: twoFactorCode.trim(),
      });
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
        toast.error("Too many attempts. Please wait 60 seconds.");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-midnight/25 via-background to-indigo/25 pointer-events-none" />
      <div className="mb-8 relative z-10">
        <Logo size="lg" />
      </div>
      <GlassCard
        surface="strong"
        padding="lg"
        className="w-full max-w-md relative z-10 border border-border shadow-xl"
      >
        {step === "credentials" ? (
          <>
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-display font-semibold text-foreground">Sign In</h1>
              <p className="text-sm text-muted-foreground">Admin portal for Grace of God Mission Asaba</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TextField
                  form={form}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                />
                <TextField form={form} name="password" label="Password" type="password" />

                {cooldown > 0 && (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1"
                  >
                    <p className="font-semibold">Too many failed login attempts</p>
                    <p>For security, sign in is temporarily locked. Please retry in {cooldown} seconds.</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full min-h-11 font-medium"
                  disabled={loading || cooldown > 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : cooldown > 0 ? (
                    `Rate limited (${cooldown}s)`
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <form onSubmit={on2faSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary mb-1">
                <KeyRound className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Two-Factor Authentication</span>
              </div>
              <h1 className="text-2xl font-display font-semibold text-foreground">Verification Code</h1>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to complete sign in.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="2fa-code">6-Digit Code</Label>
              <Input
                id="2fa-code"
                type="text"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                placeholder="000000"
                className="font-mono text-center tracking-[0.5em] text-2xl h-14"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full min-h-11 font-medium"
              disabled={loading || twoFactorCode.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Sign In"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStep("credentials");
                setTwoFactorCode("");
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to email & password
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
