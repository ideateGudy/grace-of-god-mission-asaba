"use client";

import { Section, SectionHeading } from "@/components/shared/Section";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { DateBlock, EventRow } from "@/components/shared/DateBlock";
import { MediaRow } from "@/components/shared/MediaRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ListSkeleton } from "@/components/shared/ListSkeleton";
import { Calendar } from "lucide-react";

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Section className="py-8 md:py-12">
        <div className="flex items-center justify-between mb-12 border-b border-border pb-8">
          <h1 className="font-display text-4xl font-bold">Styleguide</h1>
          <ThemeToggle />
        </div>

        <div className="space-y-16">
          <div>
            <SectionHeading>Tokens & Colors</SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-md bg-background border border-border">background</div>
              <div className="p-4 rounded-md bg-card text-card-foreground border border-border">card</div>
              <div className="p-4 rounded-md bg-primary text-primary-foreground">primary</div>
              <div className="p-4 rounded-md bg-secondary text-secondary-foreground">secondary</div>
              <div className="p-4 rounded-md bg-muted text-muted-foreground">muted</div>
              <div className="p-4 rounded-md bg-destructive text-destructive-foreground">destructive</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-md bg-midnight text-white">midnight</div>
              <div className="p-4 rounded-md bg-indigo text-white">indigo</div>
              <div className="p-4 rounded-md bg-sky text-midnight">sky</div>
              <div className="p-4 rounded-md bg-gold text-midnight">gold</div>
              <div className="p-4 rounded-md bg-paper text-midnight">paper</div>
              <div className="p-4 rounded-md bg-stone text-white">stone</div>
              <div className="p-4 rounded-md bg-night text-white">night</div>
            </div>
          </div>

          <div>
            <SectionHeading>Typography</SectionHeading>
            <div className="space-y-4">
              <h1 className="font-display text-4xl md:text-5xl leading-[1.05]">Heading 1 (Display)</h1>
              <h2 className="font-display text-3xl md:text-4xl leading-[1.1]">Heading 2 (Display)</h2>
              <h3 className="font-medium text-2xl">Heading 3 (Sans)</h3>
              <p className="text-base max-w-2xl text-muted-foreground">Body text for checking readable line length, spacing, and muted text contrast.</p>
            </div>
          </div>

          <div>
            <SectionHeading>Buttons</SectionHeading>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button className="bg-gold text-midnight hover:bg-gold/90">Brand Gold</Button>
            </div>
          </div>

          <div>
            <SectionHeading>Glass Surfaces</SectionHeading>
            <div className="grid md:grid-cols-2 gap-8 p-8 rounded-xl bg-midnight relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo via-midnight to-sky opacity-50" />
              <GlassCard surface="glass" className="relative">
                <h3 className="font-medium text-lg mb-2">Glass Surface</h3>
                <p className="text-muted-foreground text-sm">Translucent layer over a varied background.</p>
              </GlassCard>
              <GlassCard surface="strong" className="relative">
                <h3 className="font-medium text-lg mb-2">Strong Glass Surface</h3>
                <p className="text-muted-foreground text-sm">More opaque, used for heavy text or forms.</p>
              </GlassCard>
            </div>
          </div>

          <div>
            <SectionHeading>Shared Components</SectionHeading>
            <div className="space-y-8">
              <div className="flex items-center gap-4 border p-4 rounded-md">
                <span className="w-32 font-medium">StatusBadge:</span>
                <StatusBadge status="Published" />
                <StatusBadge status="Draft" />
                <StatusBadge status="Live Now" />
              </div>
              <div className="flex items-center gap-4 border p-4 rounded-md">
                <span className="w-32 font-medium">CopyButton:</span>
                <CopyButton text="1234567890" label="Account" />
              </div>
              <div className="border p-4 rounded-md space-y-4">
                <h3 className="font-medium">MediaRow</h3>
                <MediaRow title="Sample sermon title" subtitle="Sample preacher" meta="Sample date" />
                <MediaRow title="Another sample sermon" subtitle="Sample preacher" meta="Sample date" onClick={() => {}} />
              </div>
              <div className="border p-4 rounded-md space-y-4">
                <h3 className="font-medium">EventRow & DateBlock</h3>
                <EventRow title="Sample event title" venue="Sample venue" date={new Date()} />
                <div className="flex gap-4"><DateBlock date={new Date()} /></div>
              </div>
              <div className="border p-4 rounded-md grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-4">EmptyState</h3>
                  <EmptyState icon={Calendar} title="No events found" description="There are no upcoming events scheduled at this time." actionLabel="Create Event" onAction={() => {}} />
                </div>
                <div>
                  <h3 className="font-medium mb-4">ErrorState</h3>
                  <ErrorState description="Failed to load the requested data." onRetry={() => {}} />
                </div>
              </div>
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-4">ListSkeleton</h3>
                <ListSkeleton count={2} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
