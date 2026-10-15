"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { RESOURCE_CONFIG } from "./resource-config";
import { ResourceTable } from "./ResourceTable";
import { PageHeader } from "@/components/shared/PageHeader";

type Row = Record<string, unknown> & { id: string };

export function AdminResourceList({ resource }: { resource: string }) {
  const config = RESOURCE_CONFIG[resource];
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    if (!config) return;
    try {
      const result = await api.admin.list<Row>(resource, "?page=1&limit=100");
      setRows(result.data);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Unable to load these records.");
    } finally { setLoading(false); }
  }, [config, resource]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetches API-backed state after mount.
  useEffect(() => { void load(); }, [load]);
  if (!config) return <div className="space-y-3"><PageHeader title="Admin section unavailable" description="This section has not been configured yet." /><Link className="underline" href="/admin">Return to dashboard</Link></div>;
  const columns = config.columns.map((key) => ({ key, header: key === "startsAt" || key === "preachedAt" ? "Date" : key[0].toUpperCase() + key.slice(1), cell: (row: Row) => {
    const value = row[key];
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if ((key === "startsAt" || key === "preachedAt") && typeof value === "string") return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(value));
    return value == null || value === "" ? "—" : String(value);
  } }));
  const visibleRows = rows.filter((row) => !query || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query.toLowerCase())));
  const noun = { sermons: "sermon", events: "event", announcements: "announcement", gallery: "image" }[resource] ?? "item";
  return <><PageHeader title={config.title} description={`Manage published and draft ${config.title.toLowerCase()}.`} /><ResourceTable title={config.title} data={visibleRows} columns={columns} loading={loading} createLink={`/admin/${resource}/new`} createLabel={`Add ${noun}`} onSearch={setQuery} onEdit={(row) => router.push(`/admin/${resource}/${row.id}`)} onDelete={async (row) => { try { await api.admin.remove(resource, row.id); toast.success("Item deleted."); await load(); } catch (error) { toast.error(error instanceof ApiError ? error.message : "Delete failed."); } }} /></>;
}
