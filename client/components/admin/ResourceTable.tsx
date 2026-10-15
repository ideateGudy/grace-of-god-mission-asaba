"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { ListSkeleton } from "@/components/shared/ListSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  isStatus?: boolean;
}

export interface ResourceTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  createLink?: string;
  createLabel?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSearch?: (query: string) => void;
}

export function ResourceTable<T extends { id: string | number }>({
  title, data, columns, loading, emptyIcon, emptyTitle, emptyDescription,
  createLink, createLabel, onEdit, onDelete, onSearch
}: ResourceTableProps<T>) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-display font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={query} 
              onChange={handleSearch} 
              placeholder="Search..." 
              className="pl-9 w-full sm:w-64"
            />
          </div>
          {createLink && createLabel && (
            <Button asChild>
              <Link href={createLink}><Plus className="w-4 h-4 mr-2" />{createLabel}</Link>
            </Button>
          )}
        </div>
      </div>

      <GlassCard padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-6"><ListSkeleton count={5} /></div>
        ) : data.length === 0 ? (
          <EmptyState 
            icon={emptyIcon} 
            title={emptyTitle || "No records found"} 
            description={emptyDescription} 
            actionLabel={createLabel}
            onAction={createLink ? () => router.push(createLink) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => <TableHead key={col.key}>{col.header}</TableHead>)}
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map(col => (
                      <TableCell key={col.key}>
                        {col.cell ? col.cell(item) : 
                         col.isStatus ? <StatusBadge status={String(Reflect.get(item, col.key))} /> : 
                         String(Reflect.get(item, col.key))}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-strong">
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>}
                          {onDelete && <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setPendingDelete(item); }} className="text-destructive">Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>
      <ConfirmDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)} title="Delete this item?" description="This content will be removed permanently." confirmText="Delete" isDestructive onConfirm={() => { if (pendingDelete) void onDelete?.(pendingDelete); setPendingDelete(null); }} />
    </div>
  );
}
