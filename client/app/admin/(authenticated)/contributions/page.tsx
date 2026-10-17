"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Download, 
  HeartHandshake, 
  CreditCard, 
  Receipt, 
  Filter, 
  RefreshCw,
  Coins,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/lib/api/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyButton } from "@/components/shared/CopyButton";
import { usePermissions } from "@/components/shared/Can";
import { api } from "@/lib/api/client";
import type { ContributionAdminItem, ProjectPublicSummary } from "@ggm/types";

function formatNairaFromKobo(koboStr: string | number): string {
  const kobo = typeof koboStr === "string" ? BigInt(koboStr) : BigInt(Math.floor(koboStr));
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}

export default function AdminContributionsPage() {
  const { can } = usePermissions();
  const allowed = can("GIVING_MANAGE");

  const [contributions, setContributions] = useState<ContributionAdminItem[]>([]);
  const [projects, setProjects] = useState<ProjectPublicSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalRaisedKobo, setTotalRaisedKobo] = useState("0");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);

  const handleVerify = async (ref: string) => {
    setVerifyingRef(ref);
    try {
      const res = await api.giving.getStatus(ref);
      if (res.data?.status === "SUCCESS") {
        toast.success(`Transaction ${ref} verified and marked SUCCESS!`);
        await load();
      } else {
        toast.info(`Transaction ${ref} status: ${res.data?.status || "PENDING"}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify transaction with payment provider.");
    } finally {
      setVerifyingRef(null);
    }
  };

  // Load projects list for dropdown filter
  useEffect(() => {
    if (!allowed) return;
    api.admin.list<ProjectPublicSummary>("projects", "?limit=100")
      .then((res) => setProjects(res.data || []))
      .catch(() => {});
  }, [allowed]);

  const load = useCallback(async () => {
    if (!allowed) {
      setContributions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (selectedProjectId !== "ALL") {
        params.append("projectId", selectedProjectId);
      }
      if (selectedStatus !== "ALL") {
        params.append("status", selectedStatus);
      }

      const res = await api.admin.list<ContributionAdminItem>("contributions", `?${params.toString()}`);
      setContributions(res.data || []);
      setTotal(res.meta?.total || 0);
      if ((res.meta as any)?.totalRaisedKobo) {
        setTotalRaisedKobo((res.meta as any).totalRaisedKobo);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, [allowed, page, limit, selectedProjectId, selectedStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedProjectId !== "ALL") {
        params.append("projectId", selectedProjectId);
      }
      const url = `/api/v1/admin/contributions/export${params.toString() ? `?${params.toString()}` : ""}`;
      
      const res = await authFetch(url, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Could not download ledger CSV");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `giving-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Giving ledger exported successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  if (!allowed) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        You do not have permission to view giving and contributions.
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Giving & Contributions"
          description="Track incoming Paystack payments, offline tithes/gifts, and export records for church financial reconciliation."
        />
        <Button
          onClick={handleExportCsv}
          disabled={exporting}
          variant="outline"
          className="shrink-0 self-start sm:self-auto gap-2"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Generating CSV…" : "Export CSV"}
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Total Received</p>
            <p className="text-2xl font-bold font-display text-primary">{formatNairaFromKobo(totalRaisedKobo)}</p>
          </div>
        </GlassCard>

        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Transactions</p>
            <p className="text-2xl font-bold font-display">{total}</p>
          </div>
        </GlassCard>

        <GlassCard surface="solid" padding="md" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Active Campaigns</p>
            <p className="text-2xl font-bold font-display">{projects.length}</p>
          </div>
        </GlassCard>
      </div>

      {/* Filter Bar */}
      <GlassCard surface="solid" padding="md" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Filter className="w-4 h-4" />
            Filters:
          </div>

          <Select
            value={selectedProjectId}
            onValueChange={(val) => {
              setSelectedProjectId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[220px] h-9 text-xs">
              <SelectValue placeholder="All Projects / General" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Projects & General Giving</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Success Only</SelectItem>
              <SelectItem value="PENDING">Pending Only</SelectItem>
              <SelectItem value="FAILED">Failed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => void load()}
          disabled={loading}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </GlassCard>

      {/* Transactions Table */}
      <GlassCard surface="solid" padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading contributions…</div>
        ) : contributions.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No contributions match your current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Donor Details</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Africa/Lagos",
                      }).format(new Date(c.createdAt))}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium">
                        {c.donorName || c.displayName || "Anonymous"}
                        {c.isAnonymous && (
                          <Badge variant="outline" className="ml-1.5 text-[10px] py-0 px-1 font-normal text-muted-foreground">
                            Anon on web
                          </Badge>
                        )}
                      </div>
                      {(c.donorEmail || c.donorPhone) && (
                        <div className="text-xs text-muted-foreground">
                          {[c.donorEmail, c.donorPhone].filter(Boolean).join(" · ")}
                        </div>
                      )}
                      {c.message && (
                        <p className="text-xs italic text-muted-foreground/80 mt-0.5 line-clamp-1">
                          “{c.message}”
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-medium">
                        {c.projectTitle || "General Church Giving"}
                      </span>
                    </TableCell>

                    <TableCell className="font-semibold text-sm whitespace-nowrap text-foreground">
                      {formatNairaFromKobo(c.amountKobo)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-[11px] gap-1 font-normal"
                      >
                        {c.source === "ONLINE" ? (
                          <>
                            <CreditCard className="w-3 h-3 text-emerald-500" />
                            Paystack
                          </>
                        ) : (
                          <>
                            <Coins className="w-3 h-3 text-amber-500" />
                            Offline
                          </>
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          c.status === "SUCCESS"
                            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                            : c.status === "PENDING"
                            ? "bg-amber-500 hover:bg-amber-500 text-white"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {c.paystackRef ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-muted-foreground">
                              {c.paystackRef.slice(0, 10)}…
                            </span>
                            <CopyButton text={c.paystackRef} label="Reference" className="h-7 w-7" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {c.status === "PENDING" && c.paystackRef && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 px-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                            onClick={() => void handleVerify(c.paystackRef!)}
                            disabled={verifyingRef === c.paystackRef}
                          >
                            <RefreshCw className={`w-3 h-3 ${verifyingRef === c.paystackRef ? "animate-spin" : ""}`} />
                            Verify
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{page}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong> ({total} total records)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="gap-1 text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
