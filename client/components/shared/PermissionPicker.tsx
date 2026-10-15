"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CONTENT_PERMISSIONS = [
  { id: "SERMONS_MANAGE", label: "Manage Sermons" },
  { id: "EVENTS_MANAGE", label: "Manage Events" },
  { id: "ANNOUNCEMENTS_MANAGE", label: "Manage Announcements" },
  { id: "GALLERY_MANAGE", label: "Manage Gallery" },
  { id: "HERO_MANAGE", label: "Manage Hero" },
];

const INBOX_PERMISSIONS = [
  { id: "CONTACT_INBOX", label: "Contact Inbox" },
  { id: "PRAYER_INBOX", label: "Prayer Inbox (Sensitive)" },
];

export function PermissionPicker({
  selected,
  onChange
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(p => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Content</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTENT_PERMISSIONS.map(p => (
            <Label key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-[var(--radius-md)] cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
              <span className="font-normal">{p.label}</span>
            </Label>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Inbox</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INBOX_PERMISSIONS.map(p => (
            <Label key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-[var(--radius-md)] cursor-pointer hover:bg-muted/50 transition-colors">
              <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
              <span className="font-normal">{p.label}</span>
            </Label>
          ))}
        </div>
      </div>
    </div>
  );
}
