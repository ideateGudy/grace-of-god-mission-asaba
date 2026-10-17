"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { DevotionDto } from "@ggm/types";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  X,
  Sparkles,
  Flame,
  BookOpen,
  Calendar,
  BookmarkCheck,
  RotateCcw,
  Tv,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevotionPresenterProps {
  devotion: DevotionDto;
  formattedDate: string;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

type Slide =
  | {
      type: "TITLE";
      title: string;
      series: string;
      date: string;
      textRef?: string | null;
    }
  | {
      type: "VERSE";
      series: string;
      verseText: string;
      verseRef: string;
      textRef?: string | null;
    }
  | {
      type: "CONTENT";
      series: string;
      title: string;
      paragraphs: string[];
      partIndex: number;
      totalParts: number;
    }
  | {
      type: "PRAYER";
      series: string;
      title: string;
      prayer: string;
    }
  | {
      type: "BIBLE_365";
      series: string;
      readings: string[];
    }
  | {
      type: "ACTION_POINT";
      series: string;
      title: string;
      actionPoint: string;
    }
  | {
      type: "OUTRO";
      series: string;
      title: string;
    };

export function DevotionPresenter({
  devotion,
  formattedDate,
  onClose,
  isStandalonePage = false,
}: DevotionPresenterProps) {
  // Slices devotion into bite-sized presentation slides
  const slides: Slide[] = [];
  const series = devotion.series || "DAILY GRACE";

  // Slide 1: Title & Series Overview
  slides.push({
    type: "TITLE",
    title: devotion.title,
    series,
    date: formattedDate,
    textRef: devotion.textRef,
  });

  // Slide 2: Verse of the Day Anchor
  slides.push({
    type: "VERSE",
    series,
    verseText: devotion.scriptureText,
    verseRef: devotion.scriptureRef,
    textRef: devotion.textRef,
  });

  // Slide 3..N: Devotional Message Reflection Chunks
  const paragraphs = devotion.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Group 1-2 paragraphs per slide so typography stays large on projection screens
  const contentChunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentLen = 0;

  for (const para of paragraphs) {
    if (currentChunk.length > 0 && currentLen + para.length > 600) {
      contentChunks.push(currentChunk);
      currentChunk = [para];
      currentLen = para.length;
    } else {
      currentChunk.push(para);
      currentLen += para.length;
    }
  }
  if (currentChunk.length > 0) {
    contentChunks.push(currentChunk);
  }

  contentChunks.forEach((chunk, idx) => {
    slides.push({
      type: "CONTENT",
      series,
      title: devotion.title,
      paragraphs: chunk,
      partIndex: idx + 1,
      totalParts: contentChunks.length,
    });
  });

  // Closing Prayer Slide
  if (devotion.prayer) {
    slides.push({
      type: "PRAYER",
      series,
      title: devotion.title,
      prayer: devotion.prayer,
    });
  }

  // Bible in 365 Days Slide
  if (devotion.bibleIn365Days) {
    const readings = devotion.bibleIn365Days
      .split(/[\n;]+/)
      .map((r) => r.trim().replace(/^[-*•\d+.\s]+/, "").trim())
      .filter(Boolean);
    if (readings.length > 0) {
      slides.push({
        type: "BIBLE_365",
        series,
        readings,
      });
    }
  }

  // Action Point Slide
  if (devotion.actionPoint) {
    slides.push({
      type: "ACTION_POINT",
      series,
      title: devotion.title,
      actionPoint: devotion.actionPoint,
    });
  }

  // Outro & Sanctuary Service Details
  slides.push({
    type: "OUTRO",
    series,
    title: devotion.title,
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textSize, setTextSize] = useState<"normal" | "large" | "xl">("large");
  const [amenCount, setAmenCount] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIndex];

  const goNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Lock body scroll when presenter modal is open
  useEffect(() => {
    if (isStandalonePage) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isStandalonePage]);

  // Toggle native full screen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch {}
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Auto-play timer (9 seconds per slide)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      goNext();
    }, 9000);
    return () => clearInterval(interval);
  }, [isPlaying, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case "Home":
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentSlideIndex(totalSlides - 1);
          break;
        case "f":
        case "F":
          e.preventDefault();
          void toggleFullscreen();
          break;
        case "Escape":
          if (onClose) onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose, totalSlides]);

  // Auto-hide controls when idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Touch gesture handlers for mobile & tablet swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 45) {
      if (diffX > 0) {
        goPrev();
      } else {
        goNext();
      }
    }
    touchStartX.current = null;
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Text scaling class map
  const bodyTextClasses = {
    normal: "text-base sm:text-lg lg:text-xl",
    large: "text-lg sm:text-xl lg:text-2xl",
    xl: "text-xl sm:text-2xl lg:text-3xl",
  }[textSize];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative flex flex-col justify-between overflow-hidden bg-[#0A0C1D] text-white selection:bg-gold/30 selection:text-white ${
        isStandalonePage
          ? "min-h-screen w-full"
          : "fixed inset-0 z-50 h-screen w-screen backdrop-blur-2xl"
      }`}
    >
      {/* Sacred Ambient Background Lighting */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-gold/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-900/25 blur-[140px]" />

      {/* Top Presentation Bar */}
      <header
        className={`relative z-20 flex items-center justify-between border-b border-white/10 bg-[#0A0C1D]/80 px-4 sm:px-6 py-3.5 backdrop-blur-md transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber-600 shadow-md">
            <Flame className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-widest text-gold">
                {series}
              </span>
              <span className="hidden sm:inline text-xs text-white/40">|</span>
              <span className="hidden sm:inline text-xs font-medium text-white/70">
                Grace of God Mission Asaba
              </span>
            </div>
            <p className="text-[11px] text-white/50">{formattedDate}</p>
          </div>
        </div>

        {/* Center: Slide Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold text-white/80">
          <span>Slide</span>
          <span className="text-gold font-bold">{currentSlideIndex + 1}</span>
          <span>of</span>
          <span>{totalSlides}</span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Text Size Selector */}
          <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs">
            <button
              onClick={() => setTextSize("normal")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                textSize === "normal" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
              title="Normal font size"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize("large")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                textSize === "large" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
              title="Large font size"
            >
              A
            </button>
            <button
              onClick={() => setTextSize("xl")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                textSize === "xl" ? "bg-primary text-white" : "text-white/60 hover:text-white"
              }`}
              title="Extra large font size for projectors"
            >
              A+
            </button>
          </div>

          {/* Auto Play / Pause Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsPlaying((p) => !p)}
            className="h-9 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
            title={isPlaying ? "Pause auto-advance (9s)" : "Start auto-advance (9s loop)"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-1.5 text-gold" />
                <span className="hidden sm:inline">Playing</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5 text-emerald-400" />
                <span className="hidden sm:inline">Auto-Play</span>
              </>
            )}
          </Button>

          {/* Dedicated Tab/URL link if in modal */}
          {!isStandalonePage && (
            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-9 w-9 text-white/80 hover:bg-white/10 hover:text-white rounded-xl hidden sm:inline-flex"
              title="Open full dedicated projector URL (/devotion/present)"
            >
              <Link href="/devotion/present" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Native Fullscreen */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => void toggleFullscreen()}
            className="h-9 w-9 text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Projector Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Close or Return to Devotion */}
          {onClose ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-9 w-9 text-white/80 hover:bg-red-500/20 hover:text-red-400 rounded-xl"
              title="Exit presentation view (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : isStandalonePage ? (
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-9 px-3 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
              title="Return to regular devotion page"
            >
              <Link href="/devotion">
                <X className="h-4 w-4 mr-1.5" />
                <span>Exit</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 sm:px-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto">
          {/* SLIDE: TITLE */}
          {currentSlide.type === "TITLE" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-1.5 text-xs sm:text-sm font-extrabold tracking-widest text-gold uppercase shadow-lg shadow-gold/10">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>{currentSlide.series}</span>
                <span className="text-white/40">·</span>
                <span>{currentSlide.date}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70 tracking-tight leading-[1.1] max-w-4xl">
                {currentSlide.title}
              </h1>

              {currentSlide.textRef && (
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-primary/40 bg-primary/15 px-6 py-3 text-base sm:text-lg font-bold text-primary tracking-wide shadow-md">
                  <BookOpen className="h-5 w-5 text-gold" />
                  <span>TEXT: {currentSlide.textRef}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wider uppercase pt-6">
                Press Spacebar or Arrow Right to Begin Reading
              </p>
            </div>
          )}

          {/* SLIDE: VERSE OF THE DAY */}
          {currentSlide.type === "VERSE" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs sm:text-sm font-bold uppercase tracking-widest text-gold">
                <Sparkles className="h-4 w-4" />
                <span>VERSE OF THE DAY</span>
              </div>

              {currentSlide.textRef && (
                <p className="text-xs sm:text-sm font-bold text-primary tracking-wide uppercase">
                  Scripture Text: {currentSlide.textRef}
                </p>
              )}

              <div className="relative rounded-3xl border-2 border-gold/30 bg-gradient-to-b from-gold/15 via-white/5 to-transparent p-8 sm:p-14 shadow-2xl backdrop-blur-xl">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl font-serif text-gold">
                  “
                </span>
                <p className="font-serif text-2xl sm:text-4xl lg:text-5xl italic font-normal text-white leading-snug">
                  {currentSlide.verseText}
                </p>
                <div className="mt-8 inline-block rounded-full border border-gold/40 bg-gold/20 px-6 py-2 text-sm sm:text-lg font-extrabold uppercase tracking-widest text-gold shadow-md">
                  — {currentSlide.verseRef}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE: CONTENT REFLECTION */}
          {currentSlide.type === "CONTENT" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gold">
                  <BookOpen className="h-4 w-4" />
                  <span>Devotional Reflection</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/70">
                    Part {currentSlide.partIndex} of {currentSlide.totalParts}
                  </span>
                </div>
                <h3 className="hidden sm:inline font-display text-sm font-bold text-white/80 line-clamp-1">
                  {currentSlide.title}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12 shadow-xl backdrop-blur-xl space-y-6">
                {currentSlide.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className={`font-sans ${bodyTextClasses} text-white/90 leading-relaxed font-normal`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE: CLOSING PRAYER */}
          {currentSlide.type === "PRAYER" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>PRAYER FOR TODAY</span>
              </div>

              <div className="w-full rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/20 via-white/5 to-transparent p-8 sm:p-14 shadow-2xl backdrop-blur-xl space-y-8">
                <p className="font-serif text-2xl sm:text-3xl lg:text-4xl italic text-white leading-relaxed">
                  "{currentSlide.prayer}"
                </p>

                <div className="flex justify-center pt-2">
                  <Button
                    size="lg"
                    onClick={() => setAmenCount((c) => c + 1)}
                    className="rounded-full bg-gradient-to-r from-gold to-amber-500 hover:brightness-110 text-slate-950 font-extrabold px-8 py-3 text-base shadow-lg shadow-gold/20 transition active:scale-95 cursor-pointer"
                  >
                    <Flame className="h-5 w-5 mr-2" />
                    <span>Amen! ({amenCount > 0 ? `${amenCount} prayed` : "Say Amen"})</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE: BIBLE IN 365 DAYS */}
          {currentSlide.type === "BIBLE_365" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white/90">
                <Calendar className="h-4 w-4 text-primary" />
                <span>BIBLE IN 365 DAYS</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Today's Scripture Reading Plan
              </h2>

              <p className="text-sm sm:text-base text-white/70 max-w-xl">
                Stay faithful to the word. Complete the Bible in one year through daily steady reading.
              </p>

              <div className="grid gap-4 sm:grid-cols-3 w-full pt-4">
                {currentSlide.readings.map((reading, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-xl backdrop-blur-lg space-y-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <BookmarkCheck className="h-6 w-6" />
                    </div>
                    <span className="font-display text-xl sm:text-2xl font-bold text-white">
                      {reading}
                    </span>
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      Assigned Reading
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE: ACTION POINT */}
          {currentSlide.type === "ACTION_POINT" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/15 px-6 py-2 text-sm sm:text-base font-extrabold uppercase tracking-widest text-gold shadow-lg shadow-gold/20">
                <Flame className="h-5 w-5 text-gold animate-pulse" />
                <span>SPIRITUAL ACTION POINT</span>
              </div>

              <div className="w-full rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-gold/20 via-white/5 to-transparent p-8 sm:p-16 shadow-2xl backdrop-blur-xl space-y-6">
                <p className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-wide leading-tight">
                  {currentSlide.actionPoint}
                </p>

                <p className="text-sm sm:text-base font-semibold text-gold/90 max-w-lg mx-auto">
                  Take this truth with you today. Apply it in your thoughts, prayers, work, and relationships.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE: OUTRO */}
          {currentSlide.type === "OUTRO" && (
            <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-amber-600 shadow-xl shadow-gold/20">
                <Flame className="h-8 w-8 text-slate-950" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
                  Grace of God Mission Asaba
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white">
                  Have a Spirit-Filled, Victorious Day!
                </h2>
                <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                  No. 33 Arthur Richard Street, Akwuebulu, Cable Point, Asaba, Delta State.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider block">
                    Sunday Sanctuary Worship
                  </span>
                  <span className="text-base font-bold text-white mt-1 block">
                    7:00 AM — Morning Service
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider block">
                    Wednesday Midweek
                  </span>
                  <span className="text-base font-bold text-white mt-1 block">
                    5:00 PM — Bible Study & Prayer
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  onClick={() => setCurrentSlideIndex(0)}
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span>Restart Devotion</span>
                </Button>
                {onClose ? (
                  <Button
                    onClick={onClose}
                    className="rounded-xl bg-primary text-xs font-semibold text-white hover:brightness-110"
                  >
                    <span>Exit Presenter</span>
                  </Button>
                ) : isStandalonePage ? (
                  <Button
                    asChild
                    className="rounded-xl bg-primary text-xs font-semibold text-white hover:brightness-110"
                  >
                    <Link href="/devotion">Exit to Devotion Home</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide Navigation & Footer Bar */}
      <footer
        className={`relative z-20 flex flex-col gap-3 border-t border-white/10 bg-[#0A0C1D]/80 px-4 sm:px-6 py-3.5 backdrop-blur-md transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-300 rounded-full"
            style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Previous Slide Button */}
          <Button
            onClick={goPrev}
            variant="outline"
            size="sm"
            className="rounded-xl border-white/15 bg-white/5 text-xs font-bold text-white hover:bg-white/15 transition active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous Slide</span>
          </Button>

          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md py-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? "w-6 bg-gold"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next Slide Button */}
          <Button
            onClick={goNext}
            size="sm"
            className="rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:brightness-110 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-primary/20"
          >
            <span className="hidden sm:inline">Next Slide</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
