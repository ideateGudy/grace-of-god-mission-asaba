"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AuditEntry = { id: string; actorName: string | null; action: string; entity: string; entityId: string | null; createdAt: string };
export default function AuditPage() {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [entity, setEntity] = useState("");
  const [actor, setActor] = useState("");
  useEffect(() => { let cancelled = false; const params = new URLSearchParams({ page: "1", limit: "100" }); if (entity) params.set("entity", entity); if (actor) params.set("actorId", actor); api.admin.list<AuditEntry>("audit", `?${params}`).then(({ data }) => { if (!cancelled) setRows(data); }).catch(() => toast.error("Unable to load the audit log.")); return () => { cancelled = true; }; }, [entity, actor]);
  return <><PageHeader title="Audit log" description="Review recent admin actions." /><div className="mb-5 grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm">Filter by actor ID<input className="min-h-11 rounded-md border border-input bg-background px-3" value={actor} onChange={(event) => setActor(event.target.value)} /></label><label className="grid gap-2 text-sm">Filter by entity<input className="min-h-11 rounded-md border border-input bg-background px-3" value={entity} onChange={(event) => setEntity(event.target.value)} /></label></div><div className="overflow-x-auto rounded-xl border border-border bg-card"><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Record</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(row.createdAt))}</TableCell><TableCell>{row.actorName ?? "System"}</TableCell><TableCell>{row.action}</TableCell><TableCell>{row.entity}</TableCell><TableCell className="max-w-40 truncate">{row.entityId ?? "—"}</TableCell></TableRow>)}</TableBody></Table>{!rows.length && <p className="p-6 text-muted-foreground">No audit entries match this filter.</p>}</div></>;
}
