"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BookOpen,
  Quote,
  FileText,
  HeartHandshake,
  Compass,
  ArrowRight,
  RotateCcw,
  Check,
  AlertTriangle,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { parseRawDevotion, type ParsedDevotion } from "@/lib/devotion/devotion-parser";
import type { DevotionDto, CreateDevotionDto } from "@ggm/types";

interface SmartDevotionPasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (data: Partial<CreateDevotionDto>) => void;
  onDirectSave?: (data: CreateDevotionDto) => Promise<void>;
  existingDevotions?: DevotionDto[];
  editingId?: string | null;
}

const SAMPLE_DEVOTION_TEXT = `DAILY GRACE, FRIDAY, OCTOBER 16, 2026. 

LET GOD TRANSFORM YOUR LIFE

TEXT: EPHESIANS 4:22-24

VERSE OF THE DAY: _"THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW"- 2 CORINTHIANS 5:17_

Do you feel like something is missing from your life, even though on the outside it looks successful? Despite all of our accomplishments and victories in this world, we still cannot find true happiness. As a Christian, you know that true transformation can only be found by seeking God’s will for your life and allowing him to work through you. Fortunately, tapping into God’s power does not have to be complicated; there are simple steps anyone can take today to allow God to begin transforming their life.

Make Prayer a Priority. As a Christian, you know that prayer is a powerful tool. It allows you to connect with God on a deep level and seek guidance, peace, and strength. 1 Thessalonians 5:17 instructs followers of Jesus to “Pray without ceasing,” but you can often get so caught up in your busy life that you forget to make prayer a priority. That is why it is important to take time each day to speak to God and listen for his guidance. Find a time that works for you and stick to it. Create a quiet space where you can pray without distractions. Remember, prayer is a two-way conversation, so take time to listen to God’s response as well. By making prayer a priority, you can strengthen your relationship with God and let him transform you.

Another way you can let God transform your life is by reading the Bible and understanding what it says about how you should live. The Bible is not only a book of wisdom and guidance, but it also reminds us of God’s love and faithfulness toward those who believe. By getting into the Word of God, you can grow spiritually and develop a deeper relationship with him. It may be challenging at times to understand the language or the context, but you can always seek guidance from trusted Pastors, Christian friends, or even online resources. Take the time to read your Bible and let its truth transform you from the inside out.

One of the most important things you can do to strengthen your faith is to spend time in fellowship with other believers. Regularly attending church services, joining a small group Bible study, or getting involved in a ministry are all great ways to connect with other Christians and deepen your understanding of God’s Word. It can be easy to get caught up in your busy life and neglect this aspect of your faith, but making time for fellowship is crucial for your spiritual growth. Hebrews 10:25 says, “not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.” Not only does Christian fellowship provide opportunities for you to learn and be encouraged by others, but it also allows you to serve and support your brothers and sisters in Christ. Make it a priority to invest in your relationships with other believers and see how God transforms you through your connectedness.

PRAYER: Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen.

BIBLE IN 365 DAYS:
Job 42
Proverbs 25:1–14
Hebrews 5

ACTION POINT: 
MAKE PRAYER YOUR PRIORITY AS A BELIEVER.`;

export function SmartDevotionPasteDialog({
  open,
  onOpenChange,
  onApply,
  onDirectSave,
  existingDevotions = [],
  editingId = null,
}: SmartDevotionPasteDialogProps) {
  const [rawText, setRawText] = useState("");
  const [directSaving, setDirectSaving] = useState(false);

  const parsed: ParsedDevotion = useMemo(() => {
    return parseRawDevotion(rawText);
  }, [rawText]);

  // Conflict check with existing devotions
  const conflictingDevotion = useMemo(() => {
    if (!parsed.date) return null;
    return existingDevotions.find(
      (d) => d.date === parsed.date && d.id !== editingId
    );
  }, [parsed.date, existingDevotions, editingId]);

  const handleApply = () => {
    onApply({
      date: parsed.date || new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()),
      series: parsed.series || "DAILY GRACE",
      title: parsed.title,
      textRef: parsed.textRef || "",
      scriptureRef: parsed.scriptureRef,
      scriptureText: parsed.scriptureText,
      content: parsed.content,
      prayer: parsed.prayer || "",
      bibleIn365Days: parsed.bibleIn365Days || "",
      actionPoint: parsed.actionPoint || "",
      published: true,
    });
    onOpenChange(false);
  };

  const handleDirectSave = async () => {
    if (!onDirectSave || !parsed.isValid || !parsed.date) return;
    setDirectSaving(true);
    try {
      await onDirectSave({
        date: parsed.date,
        series: parsed.series || "DAILY GRACE",
        title: parsed.title,
        textRef: parsed.textRef || undefined,
        scriptureRef: parsed.scriptureRef,
        scriptureText: parsed.scriptureText,
        content: parsed.content,
        prayer: parsed.prayer || undefined,
        bibleIn365Days: parsed.bibleIn365Days || undefined,
        actionPoint: parsed.actionPoint || undefined,
        published: true,
      });
      onOpenChange(false);
      setRawText("");
    } finally {
      setDirectSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full max-w-4xl my-6 sm:my-8 max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-7 sm:py-7 rounded-2xl">
        <DialogHeader className="border-b border-border/60 pb-4 pr-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="rounded-xl bg-gold/15 p-2 text-gold border border-gold/30 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-display text-base sm:text-xl font-bold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>Smart Devotion Paste & Auto-Detect</span>
                  <Badge variant="outline" className="text-gold border-gold/30 bg-gold/10 text-[9px] sm:text-[10px]">
                    Auto-Parsing
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug break-words">
                  Paste raw devotion text directly from WhatsApp, Word, or bulletin drafts. Dates, scriptures, reflections, prayers, and action points are automatically recognized.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRawText(SAMPLE_DEVOTION_TEXT)}
              className="text-xs gap-1.5 shrink-0 rounded-lg hidden sm:flex"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-primary" />
              <span>Load Example</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-12 pt-4 min-w-0 w-full overflow-hidden">
          {/* Left Column: Raw Text Input */}
          <div className="lg:col-span-5 space-y-3 flex flex-col min-w-0 w-full">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Raw Announcement Text</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRawText(SAMPLE_DEVOTION_TEXT)}
                  className="text-[11px] h-7 px-2 text-primary sm:hidden"
                >
                  Load Example
                </Button>
                {rawText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRawText("")}
                    className="text-[11px] h-7 px-2 text-muted-foreground hover:text-destructive gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>

            <Textarea
              placeholder="Paste your daily devotion text here... (e.g. DAILY GRACE, FRIDAY, OCTOBER 16, 2026. LET GOD TRANSFORM YOUR LIFE...)"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[220px] sm:min-h-[340px] text-xs font-mono leading-relaxed bg-muted/20 resize-y flex-1 w-full"
            />
            <p className="text-[11px] text-muted-foreground break-words">
              Handles varied header spellings, markdown quotes (<code>_&quot;...&quot;_</code>), Bible verse positions, and bulleted reading plans.
            </p>
          </div>

          {/* Right Column: Live Detection Cards */}
          <div className="lg:col-span-7 space-y-3 flex flex-col min-w-0 w-full">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Detected Devotion Structure</span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {parsed.isValid ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> All required fields ready
                  </span>
                ) : rawText.trim() ? (
                  <span className="text-amber-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing {parsed.missingRequired.length} required field(s)
                  </span>
                ) : (
                  "Waiting for input..."
                )}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto overflow-x-hidden pr-1 min-w-0">
              {/* Date & Series Card */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2 text-xs shadow-2xs min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-bold">Scheduled Date & Series</span>
                  </div>
                  {parsed.detectionStatus.date ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                      Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                      Required - Missing
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 min-w-0">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold break-all">
                    {parsed.date || "Not detected (will default to today)"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gold/15 text-gold font-bold uppercase">
                    {parsed.series || "DAILY GRACE"}
                  </span>
                </div>

                {conflictingDevotion && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2 text-[11px] text-destructive flex items-start gap-2 mt-1">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="break-words min-w-0">
                      <span className="font-bold">Date Conflict:</span> A devotion is already scheduled for <strong>{parsed.date}</strong>: &quot;{conflictingDevotion.title}&quot;. Applying this will overwrite or require picking another date.
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Scripture Reading (TEXT) */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 text-xs shadow-2xs min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="font-bold text-foreground">Devotion Title</span>
                  {parsed.detectionStatus.title ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                      Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                      Required - Missing
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-foreground text-sm break-words">
                  {parsed.title || <span className="text-muted-foreground italic font-normal">Title not detected</span>}
                </p>

                {parsed.textRef && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-bold text-gold break-words">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>TEXT: {parsed.textRef}</span>
                  </div>
                )}
              </div>

              {/* Verse of the Day Card */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2 text-xs shadow-2xs min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Quote className="w-4 h-4 text-gold" />
                    <span className="font-bold">Verse of the Day</span>
                  </div>
                  {parsed.detectionStatus.scriptureRef && parsed.detectionStatus.scriptureText ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                      Detected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                      Required - Missing
                    </Badge>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="font-bold text-primary block break-words">
                    {parsed.scriptureRef || <span className="text-muted-foreground italic font-normal">Reference missing</span>}
                  </span>
                  <p className="italic text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed break-words">
                    {parsed.scriptureText ? `"${parsed.scriptureText}"` : <span className="italic font-normal">Verse text missing</span>}
                  </p>
                </div>
              </div>

              {/* Devotional Content Reflection */}
              <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1.5 text-xs shadow-2xs min-w-0">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="font-bold text-foreground">Reflection Content</span>
                  <div className="flex items-center gap-1.5">
                    {parsed.paragraphCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {parsed.paragraphCount} paragraphs · {parsed.wordCount} words
                      </span>
                    )}
                    {parsed.detectionStatus.content ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                        Detected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                        Required - Missing
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-3 leading-relaxed break-words">
                  {parsed.content || <span className="italic">Reflection content not detected</span>}
                </p>
              </div>

              {/* Optional Sections Grid */}
              <div className="grid gap-2 sm:grid-cols-3 min-w-0">
                {/* Prayer */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px] space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-foreground flex items-center gap-1 shrink-0">
                      <HeartHandshake className="w-3 h-3 text-gold" />
                      <span>Prayer</span>
                    </span>
                    {parsed.detectionStatus.prayer ? (
                      <span className="text-[9px] font-bold text-emerald-500">Found</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">Optional</span>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 italic break-words">
                    {parsed.prayer || "None detected"}
                  </p>
                </div>

                {/* 365 Days */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px] space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-foreground flex items-center gap-1 shrink-0">
                      <BookOpen className="w-3 h-3 text-primary" />
                      <span>365 Reading</span>
                    </span>
                    {parsed.detectionStatus.bibleIn365Days ? (
                      <span className="text-[9px] font-bold text-emerald-500">Found</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">Optional</span>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 break-words">
                    {parsed.bibleIn365Days?.replace(/\n/g, " · ") || "None detected"}
                  </p>
                </div>

                {/* Action Point */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px] space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-foreground flex items-center gap-1 shrink-0">
                      <Compass className="w-3 h-3 text-emerald-500" />
                      <span>Action Point</span>
                    </span>
                    {parsed.detectionStatus.actionPoint ? (
                      <span className="text-[9px] font-bold text-emerald-500">Found</span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">Optional</span>
                    )}
                  </div>
                  <p className="text-muted-foreground line-clamp-2 break-words">
                    {parsed.actionPoint || "None detected"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-2 min-w-0">
              <div className="text-[11px] sm:text-xs text-muted-foreground min-w-0">
                {!rawText.trim() ? (
                  <span>Paste text above or click <strong>Load Example</strong>.</span>
                ) : parsed.isValid ? (
                  <span className="text-emerald-500 font-semibold">
                    Ready to populate devotion form.
                  </span>
                ) : (
                  <span className="text-destructive font-medium break-words">
                    Missing: {parsed.missingRequired.join(", ")}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl text-xs flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={!parsed.title && !parsed.scriptureText && !parsed.content}
                  className="rounded-xl text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1 sm:flex-initial"
                >
                  <span>Apply to Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                {onDirectSave && (
                  <Button
                    type="button"
                    onClick={handleDirectSave}
                    disabled={!parsed.isValid || directSaving || !!conflictingDevotion}
                    className="rounded-xl text-xs gap-1.5 bg-gold hover:bg-gold/90 text-black font-bold flex-1 sm:flex-initial"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{directSaving ? "Saving..." : "Save Directly"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
