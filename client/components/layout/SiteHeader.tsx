"use client";

import Link from "next/link";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { Button } from "@/components/ui/button";

export function SiteHeader({ initialHeroTextTone = "LIGHT" }: { initialHeroTextTone?: "LIGHT" | "DARK" }) {
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const storedHeroTextTone = useUiStore((s) => s.heroTextTone);
  const heroTextTone = storedHeroTextTone || initialHeroTextTone;
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (y: number) => setCondensed(y > 24));

  const isTransparent = !condensed;
  // If on home page over light hero/white background, use dark text with transparent background
  const isLightHero = pathname === "/" && isTransparent && heroTextTone === "DARK";
  const isLuminousWhite = isTransparent && !isLightHero;

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

        <nav
          className={cn(
            "hidden items-center gap-6 md:flex font-medium text-sm transition-colors",
            condensed
              ? "text-foreground/90"
              : isLightHero
                ? "text-slate-900/90 font-semibold"
                : "text-white/90"
          )}
        >
          <Link
            href="/"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname === "/" &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/about") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            About
          </Link>
          <Link
            href="/visit"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/visit") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Visit
          </Link>
          <Link
            href="/sermons"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/sermons") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Sermons
          </Link>
          <Link
            href="/events"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/events") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Events
          </Link>
          <Link
            href="/projects"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/projects") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Projects
          </Link>

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

          <Link
            href="/contact"
            className={cn(
              "transition-colors",
              condensed
                ? "hover:text-primary"
                : isLightHero
                  ? "hover:text-primary"
                  : "hover:text-gold",
              pathname.startsWith("/contact") &&
                (condensed
                  ? "text-primary font-bold"
                  : isLightHero
                    ? "text-primary font-bold"
                    : "text-gold font-bold")
            )}
          >
            Contact
          </Link>
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

        <div className="flex md:hidden items-center gap-2">
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
