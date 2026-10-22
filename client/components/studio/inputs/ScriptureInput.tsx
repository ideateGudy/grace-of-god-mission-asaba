"use client";

import { useState, useTransition } from "react";
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tv,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type BibleTranslation,
  type StudioScriptureState,
} from "@ggm/types";
import {
  BIBLE_BOOKS,
  NIGERIAN_TRANSLATIONS,
  SANCTUARY_OFFLINE_VAULT,
  parseScriptureQuery,
  fetchScriptureVerse,
} from "@/lib/studio/bible-service";

interface ScriptureInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function ScriptureInput({ state, onChange, onTakeLive }: ScriptureInputProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isSearching, startSearching] = useTransition();
  const [lastSource, setLastSource] = useState<string>("");

  const currentScripture = state.scripture;

  const handleSearch = (queryOverride?: string) => {
    const query = queryOverride || searchInput;
    if (!query.trim()) return;

    startSearching(async () => {
      const parsed = parseScriptureQuery(query);
      if (!parsed || !parsed.bookMeta) {
        return;
      }

      const res = await fetchScriptureVerse(
        currentScripture.translation,
        parsed.bookMeta.name,
        parsed.chapter,
        parsed.verse
      );

      setLastSource(res.source);
      onChange((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          reference: res.reference,
          book: res.book,
          chapter: res.chapter,
          verse: res.verse,
          text: res.text,
        },
      }));
    });
  };

  const handleTranslationChange = (newTranslation: BibleTranslation) => {
    startSearching(async () => {
      const res = await fetchScriptureVerse(
        newTranslation,
        currentScripture.book,
        currentScripture.chapter,
        currentScripture.verse
      );

      setLastSource(res.source);
      onChange((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          translation: newTranslation,
          text: res.text,
        },
      }));
    });
  };

  const navigateVerse = (delta: number) => {
    const newVerse = Math.max(1, currentScripture.verse + delta);
    startSearching(async () => {
      const res = await fetchScriptureVerse(
        currentScripture.translation,
        currentScripture.book,
        currentScripture.chapter,
        newVerse
      );

      setLastSource(res.source);
      onChange((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          reference: `${currentScripture.book} ${currentScripture.chapter}:${newVerse}`,
          verse: newVerse,
          text: res.text,
        },
      }));
    });
  };

  const handleBookChange = (bookName: string) => {
    const b = BIBLE_BOOKS.find((bk) => bk.name === bookName) || BIBLE_BOOKS[0];
    startSearching(async () => {
      const res = await fetchScriptureVerse(
        currentScripture.translation,
        b.name,
        1,
        1
      );
      setLastSource(res.source);
      onChange((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          reference: `${b.name} 1:1`,
          book: b.name,
          chapter: 1,
          verse: 1,
          text: res.text,
        },
      }));
    });
  };

  const handleChapterChange = (chapterNum: number) => {
    startSearching(async () => {
      const res = await fetchScriptureVerse(
        currentScripture.translation,
        currentScripture.book,
        chapterNum,
        1
      );
      setLastSource(res.source);
      onChange((prev) => ({
        ...prev,
        scripture: {
          ...prev.scripture,
          reference: `${currentScripture.book} ${chapterNum}:1`,
          chapter: chapterNum,
          verse: 1,
          text: res.text,
        },
      }));
    });
  };

  const currentBookMeta =
    BIBLE_BOOKS.find((b) => b.name.toLowerCase() === currentScripture.book.toLowerCase()) ||
    BIBLE_BOOKS[0];

  return (
    <div className="space-y-4 text-white">
      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Type passage e.g. John 3:16, Rom 8:28, Phil 4:19, 2 Cor 9:7..."
            className="w-full pl-9 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
          Lookup
        </button>
      </form>

      {/* Nigerian Church Translation Switcher Pills */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          Translation (Nigerian Church Priority)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {NIGERIAN_TRANSLATIONS.map((t) => {
            const isSelected = currentScripture.translation === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTranslationChange(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(217,164,65,0.4)]"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
                }`}
                title={t.tag}
              >
                {t.id}
                {isSelected && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book, Chapter & Verse Direct Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">Book</label>
          <select
            value={currentScripture.book}
            onChange={(e) => handleBookChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {BIBLE_BOOKS.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">Chapter</label>
          <select
            value={currentScripture.chapter}
            onChange={(e) => handleChapterChange(parseInt(e.target.value, 10))}
            className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {Array.from({ length: currentBookMeta.chapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                Chapter {ch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-1">Verse Navigation</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigateVerse(-1)}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold flex items-center gap-0.5"
              title="Previous verse"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="flex-1 text-center font-bold text-amber-300 text-xs px-2 py-1 bg-black/40 rounded border border-white/10">
              v.{currentScripture.verse}
            </span>
            <button
              type="button"
              onClick={() => navigateVerse(1)}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold flex items-center gap-0.5"
              title="Next verse"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Display Mode: Fullscreen Slide vs Lower Third */}
      <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-white/5">
        <div>
          <span className="text-xs font-bold text-white block">Presentation Mode</span>
          <span className="text-[11px] text-zinc-400">
            {currentScripture.displayMode === "fullscreen"
              ? "Full Screen Sacred Typography Slide"
              : "Lower-Third Transparent Overlay for Camera Feed"}
          </span>
        </div>
        <div className="flex bg-black p-0.5 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                scripture: { ...prev.scripture, displayMode: "fullscreen" },
              }))
            }
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
              currentScripture.displayMode === "fullscreen"
                ? "bg-amber-400 text-black shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Maximize2 className="w-3 h-3" /> Full Slide
          </button>
          <button
            type="button"
            onClick={() =>
              onChange((prev) => ({
                ...prev,
                scripture: { ...prev.scripture, displayMode: "lower-third" },
              }))
            }
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1 transition-all ${
              currentScripture.displayMode === "lower-third"
                ? "bg-amber-400 text-black shadow"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Tv className="w-3 h-3" /> Lower Third
          </button>
        </div>
      </div>

      {/* Curated Sanctuary Offline Scripture Staples */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          ⛪ Church Service Staples (Instant 0ms Cache)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { ref: "ISA 60:1", label: "Isaiah 60:1 (Theme)" },
            { ref: "PSA 23:1", label: "Psalm 23:1 (Shepherd)" },
            { ref: "PHP 4:19", label: "Philippians 4:19" },
            { ref: "ROM 8:28", label: "Romans 8:28" },
            { ref: "JER 29:11", label: "Jeremiah 29:11" },
            { ref: "2CO 9:7", label: "2 Cor 9:7 (Giving)" },
            { ref: "MAL 3:10", label: "Malachi 3:10 (Tithes)" },
            { ref: "JHN 3:16", label: "John 3:16" },
          ].map((item) => (
            <button
              key={item.ref}
              type="button"
              onClick={() => handleSearch(item.label.split(" ")[0] + " " + item.label.split(" ")[1])}
              className="px-2.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 rounded-lg text-xs font-medium border border-white/5 truncate transition-colors text-left"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Scripture Preview Card */}
      <div className="p-3 bg-black/60 rounded-xl border border-amber-400/30 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 tracking-wider">
            {currentScripture.reference} ({currentScripture.translation})
          </span>
          {lastSource && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 uppercase font-mono">
              Source: {lastSource}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-serif italic">
          &ldquo;{currentScripture.text}&rdquo;
        </p>
      </div>
    </div>
  );
}
