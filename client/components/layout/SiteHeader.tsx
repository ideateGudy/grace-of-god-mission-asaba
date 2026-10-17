"use client";

import Link from "next/link";
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { Menu, ChevronDown } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { Button } from "@/components/ui/button";
import { NAV_CATEGORIES, NavCategory } from "@/lib/navigation";
import { api } from "@/lib/api/client";

export function SiteHeader({ initialHeroTextTone = "LIGHT" }: { initialHeroTextTone?: "LIGHT" | "DARK" }) {
  const [condensed, setCondensed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const { scrollY } = useScroll();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const storedHeroTextTone = useUiStore((s) => s.heroTextTone);
  const heroTextTone = storedHeroTextTone || initialHeroTextTone;
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (y: number) => setCondensed(y > 24));

  const isTransparent = !condensed;
  // If on home page over light hero/white background, use dark text with transparent background
  const isLightHero = pathname === "/" && isTransparent && heroTextTone === "DARK";

  // Check live stream status
  useEffect(() => {
    let cancelled = false;
    api.livestream
      .get()
      .then((res: { data?: { isLive?: boolean } }) => {
        if (!cancelled && res?.data?.isLive) setIsLive(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close dropdown on route change
  useEffect(() => {
    setActiveCategory(null);
  }, [pathname]);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCategory(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveCategory(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (title: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveCategory(title);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 160);
  };

  const isCategoryActive = (cat: NavCategory) => {
    return cat.items.some(
      (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
    );
  };

  const getLinkClasses = (isActive: boolean) => {
    if (isActive) {
      return condensed
        ? "text-primary font-bold"
        : isLightHero
          ? "text-primary font-bold"
          : "text-gold font-bold";
    }
    return condensed
      ? "hover:text-primary"
      : isLightHero
        ? "hover:text-primary"
        : "hover:text-gold";
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b",
        condensed
          ? "glass-strong py-2.5 border-border shadow-sm text-foreground"
          : isLightHero
            ? "bg-transparent py-4 md:py-6 border-transparent text-slate-900"
            : "bg-transparent py-4 md:py-6 border-transparent text-white"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo
            textClassName={
              condensed
                ? "text-foreground"
                : isLightHero
                  ? "text-slate-900"
                  : "text-white"
            }
          />
        </Link>

        {/* Desktop Categorized Navigation */}
        <nav
          ref={navRef}
          aria-label="Main Navigation"
          className={cn(
            "hidden items-center gap-6 md:flex font-medium text-sm transition-colors",
            condensed
              ? "text-foreground/90"
              : isLightHero
                ? "text-slate-900/90 font-semibold"
                : "text-white/90"
          )}
        >
          {/* Direct Home Link */}
          <Link
            href="/"
            className={cn("transition-colors py-1.5", getLinkClasses(pathname === "/"))}
          >
            Home
          </Link>

          {/* Categorized Dropdowns with Hover & Click */}
          {NAV_CATEGORIES.map((cat) => {
            const active = isCategoryActive(cat);
            const isOpen = activeCategory === cat.title;

            return (
              <div
                key={cat.title}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat.title)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory(isOpen ? null : cat.title)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={cn(
                    "flex items-center gap-1.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md cursor-pointer",
                    getLinkClasses(active)
                  )}
                >
                  <span>{cat.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      isOpen ? "rotate-180" : ""
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-50 w-72"
                    >
                      <div className="rounded-2xl glass-strong border border-border/80 shadow-2xl p-2 bg-background/95 dark:bg-slate-900/95 backdrop-blur-xl text-foreground ring-1 ring-black/5 dark:ring-white/10">
                        <div className="flex flex-col gap-1">
                          {cat.items.map((item) => {
                            const Icon = item.icon;
                            const isItemActive = pathname === item.href;

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setActiveCategory(null)}
                                className={cn(
                                  "group flex items-start gap-3 rounded-xl p-2.5 transition-all text-left",
                                  isItemActive
                                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                                    : "hover:bg-muted/80 text-foreground"
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors mt-0.5",
                                    isItemActive
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                                  )}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span
                                    className={cn(
                                      "text-xs font-semibold tracking-tight transition-colors",
                                      isItemActive
                                        ? "text-primary"
                                        : "text-foreground group-hover:text-primary"
                                    )}
                                  >
                                    {item.title}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {item.description}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Live Now Indicator */}
          {isLive && (
            <Link
              href="/live"
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-red-700 animate-pulse"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>Live Now</span>
            </Link>
          )}

          {/* Divider */}
          <div
            className={cn(
              "w-px h-4 mx-1 transition-colors",
              condensed
                ? "bg-border"
                : isLightHero
                  ? "bg-slate-900/20"
                  : "bg-white/20"
            )}
          />

          {/* Give CTA */}
          <Link
            href="/give"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm hover:brightness-110",
              condensed
                ? "bg-primary text-primary-foreground"
                : isLightHero
                  ? "bg-primary text-white"
                  : "bg-gold text-midnight"
            )}
          >
            Give
          </Link>

          <ThemeToggle
            className={cn(
              "transition-colors",
              condensed
                ? "text-foreground hover:bg-muted"
                : isLightHero
                  ? "text-slate-900 hover:bg-black/5"
                  : "text-white hover:bg-white/10"
            )}
          />
        </nav>

        {/* Mobile Header Buttons */}
        <div className="flex md:hidden items-center gap-2">
          {isLive && (
            <Link
              href="/live"
              className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white animate-pulse"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>Live</span>
            </Link>
          )}
          <ThemeToggle
            className={cn(
              "transition-colors",
              condensed
                ? "text-foreground hover:bg-muted"
                : isLightHero
                  ? "text-slate-900 hover:bg-black/5"
                  : "text-white hover:bg-white/10"
            )}
          />
          <Button
            id="mobile-menu-trigger"
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              "transition-colors",
              condensed
                ? "text-foreground hover:bg-muted"
                : isLightHero
                  ? "text-slate-900 hover:bg-black/5"
                  : "text-white hover:bg-white/10"
            )}
          >
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
