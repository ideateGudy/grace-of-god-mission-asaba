"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CopyButton } from "@/components/shared/CopyButton";
import { useSessionStore } from "@/store/useSessionStore";
import { api } from "@/lib/api/client";

export default function AccountPage() {
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const router = useRouter();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [loading2faSetup, setLoading2faSetup] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying2fa, setVerifying2fa] = useState(false);

  // Disable 2FA state
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disabling2fa, setDisabling2fa] = useState(false);

  const minimum = user?.role === "SUPER_ADMIN" ? 12 : 10;

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < minimum) {
      toast.error(`Choose a password with at least ${minimum} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const response = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok)
        throw new Error(
          "Could not change the password. Check your current password and try again."
        );
      const { data } = await response.json();
      setUser(data);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
      router.replace("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password update failed.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleStart2faSetup = async () => {
    setLoading2faSetup(true);
    try {
      const { data } = await api.auth.setup2fa();
      setSetupData(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate 2FA setup.");
    } finally {
      setLoading2faSetup(false);
    }
  };

  const handleVerifyAndEnable2fa = async (e: FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      toast.error("Enter the 6-digit verification code from your authenticator app.");
      return;
    }
    setVerifying2fa(true);
    try {
      const { data } = await api.auth.enable2fa(verifyCode.trim());
      if (data.twoFactorEnabled && user) {
        setUser({ ...user, twoFactorEnabled: true });
        setSetupData(null);
        setVerifyCode("");
        toast.success("Two-Factor Authentication is now enabled for your account.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid verification code.");
    } finally {
      setVerifying2fa(false);
    }
  };

  const handleDisable2fa = async (e: FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) {
      toast.error("Enter the 6-digit code from your authenticator app to confirm.");
      return;
    }
    setDisabling2fa(true);
    try {
      const { data } = await api.auth.disable2fa(disableCode.trim());
      if (!data.twoFactorEnabled && user) {
        setUser({ ...user, twoFactorEnabled: false });
        setShowDisableForm(false);
        setDisableCode("");
        toast.success("Two-Factor Authentication has been disabled.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid code. 2FA not disabled.");
    } finally {
      setDisabling2fa(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account"
        description="Update your password, two-factor authentication, and appearance preferences."
      />

      {/* Two-Factor Authentication Card */}
      <GlassCard surface="solid" padding="lg" className="max-w-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-muted-foreground">
                Enhance account security with TOTP verification codes.
              </p>
            </div>
          </div>
          <div>
            {user?.twoFactorEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldAlert className="h-3.5 w-3.5" /> Not Active
              </span>
            )}
          </div>
        </div>

        {user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two-Factor Authentication is currently protecting your administrator account.
              You will be required to provide a 6-digit TOTP code each time you sign in.
            </p>

            {!showDisableForm ? (
              <Button
                variant="outline"
                onClick={() => setShowDisableForm(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              >
                Disable 2FA
              </Button>
            ) : (
              <form onSubmit={handleDisable2fa} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4">
                <h4 className="text-sm font-semibold text-destructive">
                  Confirm Disabling Two-Factor Authentication
                </h4>
                <p className="text-xs text-muted-foreground">
                  Enter your current 6-digit authenticator app code to confirm deactivation.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="disable-2fa-code">Authenticator Code</Label>
                  <Input
                    id="disable-2fa-code"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="max-w-xs font-mono text-center tracking-widest text-lg"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={disabling2fa || disableCode.length !== 6}
                  >
                    {disabling2fa ? "Disabling..." : "Confirm & Disable 2FA"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDisableForm(false);
                      setDisableCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : setupData ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-4">
              <h3 className="font-semibold text-sm">Step 1: Scan QR Code in Authenticator App</h3>
              <p className="text-xs text-muted-foreground">
                Open Google Authenticator, 1Password, Apple Passwords, or Authy on your phone and scan this code:
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-border inline-block">
                  <Image
                    src={setupData.qrCodeDataUrl}
                    alt="2FA QR Code"
                    width={180}
                    height={180}
                    className="block"
                    unoptimized
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-foreground">Or enter key manually:</span>
                  <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-border font-mono text-xs">
                    <span className="select-all break-all">{setupData.secret}</span>
                    <CopyButton text={setupData.secret} label="2FA Secret" />
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyAndEnable2fa} className="space-y-4">
              <h3 className="font-semibold text-sm">Step 2: Enter 6-digit Code to Confirm</h3>
              <div className="space-y-2">
                <Label htmlFor="verify-2fa-code">Verification Code</Label>
                <Input
                  id="verify-2fa-code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="max-w-xs font-mono text-center tracking-widest text-lg"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={verifying2fa || verifyCode.length !== 6}
                >
                  {verifying2fa ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Activate 2FA"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSetupData(null);
                    setVerifyCode("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Protect your account from unauthorized access by requiring an authenticator app code whenever you sign in.
            </p>
            <Button onClick={handleStart2faSetup} disabled={loading2faSetup}>
              {loading2faSetup ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Secret...
                </>
              ) : (
                "Set Up Two-Factor Authentication"
              )}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Change Password Card */}
      <GlassCard surface="solid" padding="lg" className="max-w-2xl">
        <h2 className="font-display text-2xl">Change password</h2>
        {user?.mustChangePassword && (
          <p className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            Change your temporary password before continuing to other admin areas.
          </p>
        )}
        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={minimum}
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">Use at least {minimum} characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={minimum}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </GlassCard>

      {/* Appearance Card */}
      <GlassCard surface="solid" padding="lg" className="max-w-2xl">
        <h2 className="font-display text-2xl">Appearance</h2>
        <p className="my-3 text-muted-foreground">Choose a light, dark, or system theme.</p>
        <ThemeToggle />
      </GlassCard>
    </div>
  );
}
