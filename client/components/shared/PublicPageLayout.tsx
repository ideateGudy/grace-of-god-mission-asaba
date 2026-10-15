import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuickActionBar } from "@/components/layout/QuickActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";

export function PublicPageLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="flex min-h-screen flex-col"><SiteHeader /><MobileNav /><main id="main-content" className="flex-1 pt-24 pb-24 md:pb-16"><Section><PageHeader title={title} description={description} />{children}</Section></main><SiteFooter /><QuickActionBar /></div>;
}
