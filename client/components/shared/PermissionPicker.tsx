"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CONTENT_PERMISSIONS = [
  { id: "SERMONS_MANAGE", label: "Manage Sermons" },
  { id: "EVENTS_MANAGE", label: "Manage Events" },
  { id: "ANNOUNCEMENTS_MANAGE", label: "Manage Announcements" },
  { id: "GALLERY_MANAGE", label: "Manage Gallery" },
  { id: "HERO_MANAGE", label: "Manage Hero" },
  { id: "PROJECTS_MANAGE", label: "Manage Projects" },
  { id: "GIVING_MANAGE", label: "Manage Giving & Contributions" },
  { id: "TESTIMONIES_MANAGE", label: "Manage Testimonies" },
  { id: "DEVOTIONS_MANAGE", label: "Manage Daily Devotions" },
  { id: "LIVESTREAM_MANAGE", label: "Manage Livestream, Broadcast Studio & Countdown" },
];

const INBOX_PERMISSIONS = [
  { id: "CONTACT_INBOX", label: "Contact Inbox" },
  { id: "PRAYER_INBOX", label: "Prayer Inbox (Sensitive)" },
];

const CONTENT_IDS = CONTENT_PERMISSIONS.map((p) => p.id);
const INBOX_IDS = INBOX_PERMISSIONS.map((p) => p.id);
const ALL_PERMISSION_IDS = [...CONTENT_IDS, ...INBOX_IDS];

export function PermissionPicker({
  selected,
  onChange,
  showPresets = true,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
  showPresets?: boolean;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-5">
      {showPresets && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-medium text-muted-foreground">Quick select:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(ALL_PERMISSION_IDS)}
            >
              All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(CONTENT_IDS)}
            >
              Content only
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange(INBOX_IDS)}
            >
              Inbox only
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {selected.length} of {ALL_PERMISSION_IDS.length} active
          </span>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Content</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTENT_PERMISSIONS.map((p) => (
            <Label
              key={p.id}
              className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                selected.includes(p.id)
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
              <span className="font-normal">{p.label}</span>
            </Label>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Inbox</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INBOX_PERMISSIONS.map((p) => (
            <Label
              key={p.id}
              className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border p-3 transition-colors ${
                selected.includes(p.id)
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
              <span className="font-normal">{p.label}</span>
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
}
