"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label = "text", className }: { text: string, label?: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className={cn("h-11 w-11 shrink-0", className)}>
      <div className="relative flex items-center justify-center w-full h-full">
        <Copy className={cn("w-4 h-4 absolute transition-all duration-150", copied ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
        <Check className={cn("w-4 h-4 absolute transition-all duration-150", copied ? "scale-100 opacity-100 text-green-500" : "scale-0 opacity-0")} />
      </div>
      <span className="sr-only">Copy {label}</span>
    </Button>
  );
}
