"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/store/useUiStore";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="glass-strong border-l border-border w-[300px] sm:w-[400px] flex flex-col"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('mobile-menu-trigger')?.focus();
        }}
      >
        <SheetHeader className="text-left">
          <SheetTitle><Logo /></SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-6 mt-8 font-medium text-lg">
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/visit" onClick={() => setOpen(false)}>Visit us</Link>
          <Link href="/sermons" onClick={() => setOpen(false)}>Sermons</Link>
          <Link href="/events" onClick={() => setOpen(false)}>Events</Link>
          <Link href="/gallery" onClick={() => setOpen(false)}>Gallery</Link>
          <Link href="/projects" onClick={() => setOpen(false)}>Projects</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/give" onClick={() => setOpen(false)}>Give</Link>
        </div>
        <div className="flex justify-between items-center pb-8 border-t border-border pt-4">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
