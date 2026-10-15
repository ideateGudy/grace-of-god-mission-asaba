import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuickActionBar } from "@/components/layout/QuickActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SunriseBackdrop } from "@/components/motion/SunriseBackdrop";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicPageLayoutProps {
  title: string;
  description: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PublicPageLayout({
  title,
  description,
  eyebrow = "Grace of God Mission · Asaba Division",
  children,
  actions,
  className,
}: PublicPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <SunriseBackdrop />
      <SiteHeader />
      <MobileNav />

      {/* Majestic Sacred Page Hero Header Banner */}
      <section className="relative isolate overflow-hidden bg-midnight text-white pt-32 pb-16 md:pt-40 md:pb-20 px-5">
        {/* Sacred ambient light & radiant sunrise backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(217,164,65,0.22),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_40%,rgba(46,49,146,0.30),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[#0B0D22] via-[#141633] to-[#141633]"
        />

        <div className="mx-auto max-w-6xl w-full">
          <div className="max-w-3xl space-y-4">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                <span>{eyebrow}</span>
              </div>
            )}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              {title}
            </h1>
            {description && (
              <p className="text-base sm:text-lg md:text-xl font-light text-slate-200/90 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
            {actions && <div className="pt-3 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>
      </section>

      {/* Main Page Content */}
      <main id="main-content" className={cn("flex-1 py-12 md:py-20", className)}>
        <div className="mx-auto max-w-6xl px-5 w-full">{children}</div>
      </main>

      <SiteFooter />
      <QuickActionBar />
    </div>
  );
}
