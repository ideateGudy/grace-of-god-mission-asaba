"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { usePermissions } from "@/components/shared/Can";
import { useSessionStore } from "@/store/useSessionStore";
import { LogOut, Menu, LayoutDashboard, Video, Calendar, Megaphone, Image as ImageIcon, LayoutTemplate, Inbox, Users, Activity, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/sermons", label: "Sermons", icon: Video, permission: "SERMONS_MANAGE" },
  { href: "/admin/events", label: "Events", icon: Calendar, permission: "EVENTS_MANAGE" },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, permission: "ANNOUNCEMENTS_MANAGE" },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, permission: "GALLERY_MANAGE" },
  { href: "/admin/hero", label: "Hero", icon: LayoutTemplate, permission: "HERO_MANAGE" },
  { href: "/admin/messages", label: "Messages", icon: Inbox, requiresOneOf: ["CONTACT_INBOX", "PRAYER_INBOX"] },
  { href: "/admin/users", label: "Users", icon: Users, superAdminOnly: true },
  { href: "/admin/audit", label: "Audit Log", icon: Activity, superAdminOnly: true },
  { href: "/admin/account", label: "Account", icon: UserCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useSessionStore();
  const { can, isSuperAdmin } = usePermissions();

  useEffect(() => {
    if (user?.mustChangePassword && pathname !== "/admin/account" && pathname !== "/admin/login") {
      router.push("/admin/account");
    }
  }, [user, pathname, router]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    router.push("/admin/login");
  };

  const renderNavItems = () => {
    return NAV_ITEMS.map(item => {
      let allowed = true;
      if (item.superAdminOnly && !isSuperAdmin) allowed = false;
      if (item.permission && !can(item.permission)) allowed = false;
      if (item.requiresOneOf && !item.requiresOneOf.some(p => can(p))) allowed = false;

      if (!allowed) return null;

      const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

      return (
        <Link 
          key={item.href} 
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
            active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {item.label}
        </Link>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 w-full bg-background flex flex-col md:flex-row overflow-clip"
      onScroll={(e) => {
        e.currentTarget.scrollTop = 0;
        e.currentTarget.scrollLeft = 0;
      }}
    >
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shrink-0">
        <Logo className="text-xl" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-strong border-r border-border w-64 p-0 flex flex-col h-full">
            <SheetHeader className="p-6 text-left border-b border-border shrink-0">
              <SheetTitle><Logo className="text-xl" /></SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
              {renderNavItems()}
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between shrink-0">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="w-5 h-5 text-destructive" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar with independent vertical scroll */}
      <aside className="relative hidden md:flex flex-col w-64 h-full border-r border-border bg-card shrink-0 select-none overflow-hidden">
        <div className="p-6 border-b border-border shrink-0">
          <Link href="/"><Logo className="text-xl" /></Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {renderNavItems()}
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area with independent vertical scroll */}
      <main className="relative flex-1 min-h-0 min-w-0 h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
