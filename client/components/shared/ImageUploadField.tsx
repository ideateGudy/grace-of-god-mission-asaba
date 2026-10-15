"use client";

import { useId, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadCloud, Loader2, Image as ImageIcon, X } from "lucide-react";

type Scope = "sermons" | "events" | "gallery" | "hero";

export function ImageUploadField({
  label,
  value,
  onChange,
  scope = "gallery",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  scope?: Scope;
  required?: boolean;
}) {
  const inputId = useId();
  const fileInputId = useId();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, AVIF).");
      return;
    }

    // Limit client file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be under 10MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      // 1. Request signed upload credentials from server
      const sigResponse = await fetch("/api/v1/admin/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });

      if (!sigResponse.ok) {
        const errorJson = await sigResponse.json().catch(() => null);
        throw new Error(errorJson?.message || "Failed to generate upload signature.");
      }

      const { data } = await sigResponse.json();

      // 2. Perform direct signed upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", data.apiKey);
      formData.append("timestamp", String(data.timestamp));
      formData.append("signature", data.signature);
      if (data.folder) formData.append("folder", data.folder);
      if (data.publicId) formData.append("public_id", data.publicId);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => null);
        throw new Error(uploadError?.error?.message || "Upload to Cloudinary failed.");
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url || uploadResult.url;

      onChange(imageUrl);
      toast.success("Image uploaded successfully.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.", { id: toastId });
    } finally {
      setUploading(false);
      // Reset input value so re-selecting the same file triggers change
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span aria-hidden="true" className="text-destructive"> *</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear image
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Hidden native file input accessible via label and Playwright */}
        <input
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          disabled={uploading}
          className="sr-only"
        />

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById(fileInputId)?.click()}
          className="shrink-0 flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              <span>Choose File</span>
            </>
          )}
        </Button>

        <div className="flex-1 w-full">
          <Input
            id={inputId}
            type="url"
            required={required}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://res.cloudinary.com/... or direct image URL"
            aria-label={`${label} URL`}
            disabled={uploading}
          />
        </div>
      </div>

      {value ? (
        <div className="relative w-28 h-20 rounded-md border border-border overflow-hidden bg-muted/40 flex items-center justify-center group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ImageIcon size={12} />
          Choose an image file to upload to Cloudinary or paste a direct image URL.
        </p>
      )}
    </div>
  );
}
