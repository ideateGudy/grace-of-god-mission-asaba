"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Archive, Check, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePermissions } from "@/components/shared/Can";

import { authFetch } from "@/lib/api/client";

type InboxMessage = { id: string; name: string | null; email: string | null; phone: string | null; message?: string; request?: string; status: "NEW" | "READ" | "ARCHIVED"; createdAt: string };
type InboxKind = "contact" | "prayer-requests";
async function inboxRequest(kind: InboxKind, id?: string, status?: string, method = "GET") {
  const url = `/api/v1/admin/${kind}${id ? `/${encodeURIComponent(id)}` : ""}`;
  const response = await authFetch(url, { method, headers: status ? { "Content-Type": "application/json" } : undefined, body: status ? JSON.stringify({ status }) : undefined, cache: "no-store" });
  if (!response.ok) throw new Error("This inbox request could not be completed.");
  return response.status === 204 ? null : response.json();
}

export default function MessagesPage() {
  const { can, isSuperAdmin } = usePermissions();
  const [kind, setKind] = useState<InboxKind>("contact");
  const [rows, setRows] = useState<InboxMessage[]>([]);
  const [pendingDelete, setPendingDelete] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const allowed = kind === "contact" ? can("CONTACT_INBOX") : can("PRAYER_INBOX");
  const load = useCallback(async () => {
    if (!allowed) { setRows([]); setLoading(false); return; }
    try { const result = await inboxRequest(kind); setRows(result?.data ?? []); }
    catch { toast.error("Unable to load this inbox."); }
    finally { setLoading(false); }
  }, [allowed, kind]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches API-backed state after mount.
  useEffect(() => { void load(); }, [load]);
  const updateStatus = async (row: InboxMessage, status: "READ" | "ARCHIVED") => {
    try { await inboxRequest(kind, row.id, status, "PATCH"); toast.success(status === "READ" ? "Marked as read." : "Archived."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Update failed."); }
  };
  const remove = async () => {
    if (!pendingDelete) return;
    try { await inboxRequest(kind, pendingDelete.id, undefined, "DELETE"); toast.success("Message deleted permanently."); setPendingDelete(null); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed."); }
  };
  return <><PageHeader title="Messages" description="Review contact messages and private prayer requests." />
    <Tabs value={kind} onValueChange={(value) => setKind(value as InboxKind)}>
      <TabsList className="h-auto flex-wrap"><TabsTrigger value="contact" disabled={!can("CONTACT_INBOX")}>Contact inbox</TabsTrigger><TabsTrigger value="prayer-requests" disabled={!can("PRAYER_INBOX")}>Prayer requests</TabsTrigger></TabsList>
      {(["contact", "prayer-requests"] as InboxKind[]).map((tab) => <TabsContent key={tab} value={tab}>
        {!allowed ? <p className="py-10 text-muted-foreground">You do not have permission to view this inbox.</p> : loading ? <p role="status" className="py-10 text-muted-foreground">Loading messages…</p> : rows.length === 0 ? <p className="py-10 text-muted-foreground">This inbox is clear.</p> : <div className="space-y-4">{rows.map((row) => <GlassCard key={row.id} surface="solid" padding="md" className={row.status === "NEW" ? "border-primary/40" : ""}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{row.name || "Anonymous"}</h2><p className="text-sm text-muted-foreground">{[row.email, row.phone].filter(Boolean).join(" · ") || "No reply details provided"}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{row.status} · {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(row.createdAt))}</span></div>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed">{row.message ?? row.request}</p>
          <div className="mt-4 flex flex-wrap gap-2">{row.status !== "READ" && <Button size="sm" variant="outline" onClick={() => void updateStatus(row, "READ")}><Check className="mr-2 size-4" />Mark read</Button>}{row.status !== "ARCHIVED" && <Button size="sm" variant="outline" onClick={() => void updateStatus(row, "ARCHIVED")}><Archive className="mr-2 size-4" />Archive</Button>}{isSuperAdmin && <Button size="sm" variant="destructive" onClick={() => setPendingDelete(row)}><Trash2 className="mr-2 size-4" />Delete permanently</Button>}</div>
        </GlassCard>)}</div>}
      </TabsContent>)}
    </Tabs>
    <ConfirmDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)} title="Delete this message permanently?" description="The message and its personal information will be removed from the inbox." confirmText="Delete permanently" onConfirm={() => void remove()} isDestructive />
  </>;
}
