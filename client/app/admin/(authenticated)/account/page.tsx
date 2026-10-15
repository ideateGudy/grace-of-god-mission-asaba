"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useSessionStore } from "@/store/useSessionStore";

export default function AccountPage() {
  const user = useSessionStore((state) => state.user);
  const setUser = useSessionStore((state) => state.setUser);
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const minimum = user?.role === "SUPER_ADMIN" ? 12 : 10;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < minimum) { toast.error(`Choose a password with at least ${minimum} characters.`); return; }
    if (newPassword !== confirmPassword) { toast.error("The passwords do not match."); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/v1/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      if (!response.ok) throw new Error("Could not change the password. Check your current password and try again.");
      const { data } = await response.json();
      setUser(data);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast.success("Password updated.");
      router.replace("/admin");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Password update failed."); }
    finally { setSaving(false); }
  };
  return <div className="space-y-8"><PageHeader title="Account" description="Update your password and appearance preference." />
    <GlassCard surface="solid" padding="lg" className="max-w-2xl"><h2 className="font-display text-2xl">Change password</h2>{user?.mustChangePassword && <p className="mt-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">Change your temporary password before continuing to other admin areas.</p>}<form onSubmit={submit} className="mt-6 space-y-5">
      <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={minimum} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><p className="text-sm text-muted-foreground">Use at least {minimum} characters.</p></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={minimum} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
      <Button type="submit" disabled={saving}>{saving ? "Updating…" : "Update password"}</Button>
    </form></GlassCard>
    <GlassCard surface="solid" padding="lg" className="max-w-2xl"><h2 className="font-display text-2xl">Appearance</h2><p className="my-3 text-muted-foreground">Choose a light, dark, or system theme.</p><ThemeToggle /></GlassCard>
  </div>;
}
