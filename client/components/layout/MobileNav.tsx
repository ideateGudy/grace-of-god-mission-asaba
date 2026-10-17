"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/store/useUiStore";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NAV_CATEGORIES } from "@/lib/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="glass-strong border-l border-border w-[310px] sm:w-[380px] flex flex-col p-6 overflow-y-auto"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('mobile-menu-trigger')?.focus();
        }}
      >
        <SheetHeader className="text-left border-b border-border pb-4">
          <SheetTitle><Logo /></SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-2 mt-4 font-medium text-base">
          {/* Direct Home Link */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors",
              pathname === "/"
                ? "bg-primary/10 text-primary font-bold"
                : "text-foreground hover:bg-muted"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Home className="w-4 h-4" />
            </div>
            <span>Home</span>
          </Link>

          {/* Categorized Accordion */}
          <Accordion type="multiple" className="w-full">
            {NAV_CATEGORIES.map((cat, idx) => {
              const isCategoryActive = cat.items.some(
                (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              );

              return (
                <AccordionItem key={cat.title} value={`item-${idx}`} className="border-b-0 py-0.5">
                  <AccordionTrigger
                    className={cn(
                      "py-2.5 px-3 rounded-xl hover:no-underline transition-colors hover:bg-muted text-sm font-semibold",
                      isCategoryActive ? "text-primary font-bold" : "text-foreground"
                    )}
                  >
                    <span>{cat.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-2 px-2">
                    <div className="flex flex-col gap-1 border-l-2 border-primary/20 ml-3 pl-3">
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 py-2 px-2 rounded-lg text-xs transition-colors",
                              isItemActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Give CTA */}
          <div className="pt-4">
            <Link
              href="/give"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gold text-midnight font-bold text-sm shadow hover:brightness-110 transition-all"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Give / Support Us</span>
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-t border-border pt-4 mt-auto">
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
