"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { DevotionDto } from "@ggm/types";

interface DevotionActionsProps {
  devotion: DevotionDto;
  formattedDate: string;
}

export function DevotionActions({ devotion, formattedDate }: DevotionActionsProps) {
  const [copied, setCopied] = useState(false);

  const getFullDevotionText = () => {
    const seriesText = devotion.series || "DAILY GRACE";
    const textRefLine = devotion.textRef ? `\n\nTEXT: ${devotion.textRef}` : "";
    const bible365Line = devotion.bibleIn365Days
      ? `\n\nBIBLE IN 365 DAYS:\n${devotion.bibleIn365Days}`
      : "";
    const actionPointLine = devotion.actionPoint
      ? `\n\nACTION POINT:\n${devotion.actionPoint}`
      : "";
    const prayerLine = devotion.prayer ? `\n\nPRAYER: ${devotion.prayer}` : "";

    return `${seriesText}, ${formattedDate.toUpperCase()}.\n\n${devotion.title.toUpperCase()}${textRefLine}\n\nVERSE OF THE DAY: "${devotion.scriptureText}" - ${devotion.scriptureRef}\n\n${devotion.content}${prayerLine}${bible365Line}${actionPointLine}\n\nRead online: https://graceofgodasaba.org/devotion\nGrace of God Mission Asaba`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullDevotionText());
      setCopied(true);
      toast.success("Devotion copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleShare = async () => {
    const text = getFullDevotionText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${devotion.series || "DAILY GRACE"} - ${devotion.title}`,
          text,
          url: "https://graceofgodasaba.org/devotion",
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          await handleCopy();
        }
      }
    } else {
      // Fallback: Open WhatsApp share directly
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="rounded-xl border-border/80 bg-background/50 backdrop-blur text-xs font-semibold hover:border-primary/50"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span>Copy Devotion</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="rounded-xl border-border/80 bg-background/50 backdrop-blur text-xs font-semibold hover:border-primary/50"
      >
        <Share2 className="h-3.5 w-3.5 mr-1.5 text-gold" />
        <span>Share</span>
      </Button>
    </div>
  );
}
