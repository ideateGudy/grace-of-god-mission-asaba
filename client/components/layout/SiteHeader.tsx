"use client";

import Link from "next/link";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
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

  useMotionValueEvent(scrollY, "change", (y: number) => setCondensed(y > 24));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-200 border-b border-transparent",
        condensed ? "glass-strong py-2 border-border" : "bg-transparent py-4 md:py-6"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex font-medium text-sm">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/visit" className="hover:text-primary transition-colors">Visit</Link>
          <Link href="/sermons" className="hover:text-primary transition-colors">Sermons</Link>
          <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
          <div className="w-px h-4 bg-border mx-2" />
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link href="/give" className="hover:text-primary transition-colors">Give</Link>
          <ThemeToggle />
        </nav>
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button id="mobile-menu-trigger" variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
