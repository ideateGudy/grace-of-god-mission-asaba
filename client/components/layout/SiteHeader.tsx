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

export function SiteHeader() {
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (y: number) => setCondensed(y > 24));

  // At top of page over dark hero/sacred banner, use luminous text-white.
  // When scrolled (condensed), use glass-strong backdrop with text-foreground.
  const isTransparent = !condensed;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b",
        condensed
          ? "glass-strong py-2.5 border-border shadow-sm text-foreground"
          : "bg-transparent py-4 md:py-6 border-transparent text-white"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo textClassName={isTransparent ? "text-white" : "text-foreground"} />
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-6 md:flex font-medium text-sm transition-colors",
            isTransparent ? "text-white/90" : "text-foreground"
          )}
        >
          <Link
            href="/"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname === "/" && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname.startsWith("/about") && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            About
          </Link>
          <Link
            href="/visit"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname.startsWith("/visit") && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            Visit
          </Link>
          <Link
            href="/sermons"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname.startsWith("/sermons") && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            Sermons
          </Link>
          <Link
            href="/events"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname.startsWith("/events") && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            Events
          </Link>

          <div
            className={cn(
              "w-px h-4 mx-1 transition-colors",
              isTransparent ? "bg-white/20" : "bg-border"
            )}
          />

          <Link
            href="/contact"
            className={cn(
              "transition-colors",
              isTransparent ? "hover:text-gold" : "hover:text-primary",
              pathname.startsWith("/contact") && (isTransparent ? "text-gold font-bold" : "text-primary font-bold")
            )}
          >
            Contact
          </Link>
          <Link
            href="/give"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
              isTransparent
                ? "bg-gold text-midnight hover:brightness-110 shadow-sm"
                : "bg-primary text-primary-foreground hover:brightness-110"
            )}
          >
            Give
          </Link>

          <ThemeToggle
            className={cn(
              "transition-colors",
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground"
            )}
          />
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle
            className={cn(
              "transition-colors",
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground"
            )}
          />
          <Button
            id="mobile-menu-trigger"
            variant="ghost"
            size="icon"
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              "transition-colors",
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground"
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
