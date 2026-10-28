"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { RESOURCE_CONFIG, type ResourceField } from "./resource-config";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { fromLagosDateTimeInput, toLagosDateTimeInput } from "@/lib/date";
import { ImageUploadField } from "@/components/shared/ImageUploadField";

type RecordValue = Record<string, unknown>;
const emptyRecord = (fields: ResourceField[]) =>
  Object.fromEntries(fields.map(({ key, type }) => [key, type === "checkbox" ? key === "published" : ""]));
const toInputValue = (value: unknown, type?: ResourceField["type"]) => {
  if (value == null) return "";
  if (type === "datetime-local" && typeof value === "string") return toLagosDateTimeInput(value);
  return String(value);
};

export function AdminResourceEditor({ resource, id }: { resource: string; id: string }) {
  const config = RESOURCE_CONFIG[resource];
  const router = useRouter();
  const isNew = id === "new";
  const [values, setValues] = useState<RecordValue>(() => config ? emptyRecord(config.fields) : {});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!config || isNew) return;
    let cancelled = false;
    api.admin.get<RecordValue>(resource, id).then(({ data }) => {
      if (!cancelled && data) {
        const formatted: RecordValue = { ...emptyRecord(config.fields) };
        for (const field of config.fields) {
          const val = data[field.key];
          if (field.type === "datetime-local") {
            formatted[field.key] = toInputValue(val, "datetime-local");
          } else {
            formatted[field.key] = val ?? (field.type === "checkbox" ? false : "");
          }
        }
        setValues(formatted);
      }
    }).catch((error) => toast.error(error instanceof ApiError ? error.message : "Unable to load this record.")).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [config, id, isNew, resource]);
  if (!config) return <PageHeader title="Editor unavailable" description="This content type is not configured." />;
  const setValue = (field: ResourceField, value: string | boolean) => setValues((current) => ({ ...current, [field.key]: value }));
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const val = values[field.key];
      if (field.type === "datetime-local") {
        payload[field.key] = val ? fromLagosDateTimeInput(String(val)) : null;
      } else if (field.type === "url" || field.key === "audioUrl" || field.key === "videoUrl") {
        const raw = typeof val === "string" ? val.trim() : "";
        if (!raw) {
          payload[field.key] = null;
        } else {
          let formatted = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
          const driveMatch = formatted.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/);
          if (driveMatch && driveMatch[1]) {
            formatted = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
          }
          payload[field.key] = formatted;
        }
      } else if (field.type === "number") {
        payload[field.key] = val === "" || val == null ? (field.key === "sortOrder" ? 0 : null) : Number(val);
      } else if (field.type === "checkbox") {
        payload[field.key] = Boolean(val);
      } else {
        const strVal = typeof val === "string" ? val.trim() : val;
        if (field.key === "slug") {
          // If slug is left blank or empty string, omit it completely so backend generates it from title
          if (strVal) payload[field.key] = strVal;
        } else {
          payload[field.key] = strVal === "" ? null : strVal;
        }
      }
    }
    try {
      if (isNew) await api.admin.create(resource, payload);
      else await api.admin.update(resource, id, payload);
      toast.success(isNew ? "Created." : "Changes saved.");
      router.push(`/admin/${resource}`);
    } catch (error) { toast.error(error instanceof ApiError ? error.message : "Unable to save this item."); }
    finally { setSaving(false); }
  };
  if (loading) return <p role="status" className="py-10 text-muted-foreground">Loading record…</p>;
  return <div className="space-y-6"><PageHeader title={`${isNew ? "Add" : "Edit"} ${config.title.slice(0, -1)}`} description="Changes are saved to the church website content system." /><form onSubmit={onSubmit} className="max-w-3xl space-y-5 pb-24">
    {config.fields.map((field) => <div key={field.key} className="space-y-2">
      {field.type === "checkbox" ? <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" checked={Boolean(values[field.key])} onChange={(event) => setValue(field, event.target.checked)} className="size-5 accent-primary" />{field.label}</label>
        : field.type === "image" ? <ImageUploadField label={field.label} value={toInputValue(values[field.key])} required={field.required} scope={resource as "sermons" | "events" | "gallery"} onChange={(url) => setValue(field, url)} />
          : <><label htmlFor={field.key} className="text-sm font-medium">{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>{field.type === "textarea" ? <textarea id={field.key} required={field.required} value={toInputValue(values[field.key], field.type)} onChange={(event) => setValue(field, event.target.value)} rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-ring" /> : <input id={field.key} type={field.type ?? "text"} required={field.required} value={toInputValue(values[field.key], field.type)} onChange={(event) => setValue(field, event.target.value)} className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-ring" />}</>}
    </div>)}
    <div className="sticky bottom-0 z-30 -mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-8 flex justify-end gap-3 border-t border-border bg-background/95 p-4 md:px-8 backdrop-blur"><Button type="button" variant="outline" onClick={() => router.push(`/admin/${resource}`)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></div>
  </form></div>;
}
