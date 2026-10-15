"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PermissionPicker } from "@/components/shared/PermissionPicker";
import { CopyButton } from "@/components/shared/CopyButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

type AdminUser = { id: string; name: string; email: string; role: "SUPER_ADMIN" | "ADMIN"; permissions: string[]; isActive: boolean; status: string; lastLoginAt: string | null };
async function usersRequest(path = "", init?: RequestInit) {
  const response = await fetch(`/api/v1/admin/users${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  if (!response.ok) { const payload = await response.json().catch(() => null); throw new Error(payload?.message ?? "The user request could not be completed."); }
  return response.status === 204 ? null : response.json();
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["SERMONS_MANAGE", "EVENTS_MANAGE", "ANNOUNCEMENTS_MANAGE", "GALLERY_MANAGE", "HERO_MANAGE"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [pending, setPending] = useState<{ user: AdminUser; action: "delete" | "reset" } | null>(null);
  const load = useCallback(async () => { try { const result = await usersRequest(); setUsers(result?.data ?? []); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load users."); } finally { setLoading(false); } }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches API-backed state after mount.
  useEffect(() => { void load(); }, [load]);
  const create = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); try { const result = await usersRequest("", { method: "POST", body: JSON.stringify({ name, email, permissions }) }); setTemporaryPassword(result.data.temporaryPassword); setName(""); setEmail(""); toast.success("Admin created. Copy the temporary password now."); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create admin."); } finally { setSaving(false); } };
  const runAction = async () => {
    if (!pending) return;
    try {
      if (pending.action === "reset") { const result = await usersRequest(`/${pending.user.id}/reset-password`, { method: "POST" }); setTemporaryPassword(result.data.temporaryPassword); }
      else await usersRequest(`/${pending.user.id}`, { method: "DELETE" });
      toast.success(pending.action === "reset" ? "Temporary password created." : "Admin removed.");
      setPending(null); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "That action failed."); }
  };
  const toggleActive = async (user: AdminUser) => { try { await usersRequest(`/${user.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !user.isActive }) }); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update this admin."); } };
  return <div className="space-y-8"><PageHeader title="Admin users" description="Create staff accounts with only the permissions they need." />
    <GlassCard surface="solid" padding="lg"><h2 className="font-display text-2xl">Add an admin</h2><form onSubmit={create} className="mt-5 grid gap-5 md:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="admin-name">Name</Label><Input id="admin-name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></div>
      <div className="md:col-span-2"><PermissionPicker selected={permissions} onChange={setPermissions} /></div>
      <div className="md:col-span-2"><Button disabled={saving}>{saving ? "Creating…" : "Create admin"}</Button></div>
    </form></GlassCard>
    <section><h2 className="mb-4 font-display text-2xl">Existing accounts</h2>{loading ? <p role="status" className="py-8 text-muted-foreground">Loading admin accounts…</p> : <div className="space-y-3">{users.map((user) => <GlassCard key={user.id} surface="solid" padding="md" className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">{user.name} <span className="ml-2 rounded-full bg-muted px-2 py-1 text-xs">{user.role.replace("_", " ")}</span></p><p className="text-sm text-muted-foreground">{user.email} · {user.status}{user.lastLoginAt ? ` · Last login ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(user.lastLoginAt))}` : ""}</p><div className="mt-2 flex flex-wrap gap-1">{user.permissions.map((permission) => <span key={permission} className="rounded-full border border-border px-2 py-1 text-xs">{permission.replace("_MANAGE", "")}</span>)}</div></div>
      {user.role !== "SUPER_ADMIN" && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void toggleActive(user)}>{user.isActive ? "Deactivate" : "Reactivate"}</Button><Button size="sm" variant="outline" onClick={() => setPending({ user, action: "reset" })}>Reset password</Button><Button size="sm" variant="destructive" onClick={() => setPending({ user, action: "delete" })}>Delete</Button></div>}</GlassCard>)}</div>}</section>
    {temporaryPassword && <GlassCard surface="strong" padding="md" className="border-primary"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Temporary password — shown once</h2><p className="mt-1 break-all font-mono">{temporaryPassword}</p><p className="mt-1 text-sm text-muted-foreground">Share it securely. The admin will be required to change it after sign-in.</p></div><div className="flex gap-2"><CopyButton text={temporaryPassword} label="Temporary password" /><Button variant="outline" onClick={() => setTemporaryPassword(null)}>Dismiss</Button></div></div></GlassCard>}
    <ConfirmDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)} title={pending?.action === "delete" ? "Delete this admin?" : "Reset this admin’s password?"} description={pending?.action === "delete" ? "The account will be removed permanently." : "A new one-time password will invalidate the current session and require a password change."} confirmText={pending?.action === "delete" ? "Delete admin" : "Reset password"} onConfirm={() => void runAction()} isDestructive={pending?.action === "delete"} />
  </div>;
}
