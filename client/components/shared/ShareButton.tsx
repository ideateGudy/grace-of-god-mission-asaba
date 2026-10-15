"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ title }: { title: string }) {
  const share = async () => { try { if (navigator.share) await navigator.share({ title, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast.success("Link copied."); } } catch (error) { if (error instanceof Error && error.name !== "AbortError") toast.error("Could not share this link."); } };
  return <Button type="button" variant="outline" className="min-h-11" onClick={() => void share()}><Share2 className="mr-2 size-4" />Share</Button>;
}
