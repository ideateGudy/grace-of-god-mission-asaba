"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { usePermissions } from "@/components/shared/Can";
import {
  LogOut,
  Menu,
  LayoutDashboard,
  Video,
  Calendar,
  Megaphone,
  Image as ImageIcon,
  LayoutTemplate,
  Inbox,
  Users,
  Activity,
  UserCircle,
  FolderKanban,
  HeartHandshake,
  Settings,
  Radio,
  BookOpen,
  Sparkles,
  Palette,
  Clock,
  Tv,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { useSessionStore } from "@/store/useSessionStore";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "Broadcast Studio", icon: Tv, permission: "LIVESTREAM_MANAGE" },
  { href: "/admin/live", label: "Livestream", icon: Radio, permission: "LIVESTREAM_MANAGE" },
  { href: "/admin/sermons", label: "Sermons", icon: Video, permission: "SERMONS_MANAGE" },
  { href: "/admin/devotions", label: "Devotions", icon: BookOpen, permission: "DEVOTIONS_MANAGE" },
  { href: "/admin/flyers", label: "Flyer Studio", icon: Palette },
  { href: "/admin/testimonies", label: "Testimonies", icon: Sparkles, permission: "TESTIMONIES_MANAGE" },
  { href: "/admin/events", label: "Events", icon: Calendar, permission: "EVENTS_MANAGE" },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, permission: "ANNOUNCEMENTS_MANAGE" },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, permission: "GALLERY_MANAGE" },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban, permission: "PROJECTS_MANAGE" },
  { href: "/admin/contributions", label: "Contributions", icon: HeartHandshake, permission: "GIVING_MANAGE" },
  { href: "/admin/hero", label: "Hero", icon: LayoutTemplate, permission: "HERO_MANAGE" },
  { href: "/admin/messages", label: "Messages", icon: Inbox, requiresOneOf: ["CONTACT_INBOX", "PRAYER_INBOX"] },
  { href: "/admin/users", label: "Users", icon: Users, superAdminOnly: true },
  { href: "/admin/audit", label: "Audit Log", icon: Activity, superAdminOnly: true },
  { href: "/admin/settings", label: "Site Settings", icon: Settings, superAdminOnly: true },
  { href: "/admin/account", label: "Account", icon: UserCircle },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useSessionStore();
  const { can, isSuperAdmin } = usePermissions();

  // Load persistent sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gom_admin_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem("gom_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (user?.mustChangePassword && pathname !== "/admin/account" && pathname !== "/admin/login") {
      router.push("/admin/account");
    }
  }, [user, pathname, router]);

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("gom_access_token");
      localStorage.removeItem("gom_refresh_token");
    }
    setUser(null);
    router.push("/admin/login");
  };

  const renderNavItems = (collapsed = false) => {
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
          title={collapsed ? item.label : undefined}
          className={cn(
            "flex items-center rounded-[var(--radius-md)] text-sm font-medium transition-all group relative",
            collapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2",
            active ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && (
            <span className="sr-only">{item.label}</span>
          )}
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

      {/* Desktop Sidebar with independent vertical scroll and collapse toggle */}
      <aside 
        className={cn(
          "relative hidden md:flex flex-col h-full border-r border-border bg-card shrink-0 select-none overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "w-18" : "w-64"
        )}
      >
        <div className={cn("border-b border-border shrink-0 flex items-center justify-between", isCollapsed ? "p-4 justify-center" : "p-6")}>
          <Link href="/" className="overflow-hidden">
            {isCollapsed ? (
              <span className="font-display font-black text-xl text-primary">GGM</span>
            ) : (
              <Logo className="text-xl" />
            )}
          </Link>
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Collapsed expand trigger button at top */}
        {isCollapsed && (
          <div className="p-2 flex justify-center border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className={cn("flex-1 overflow-y-auto space-y-1 custom-scrollbar", isCollapsed ? "p-2" : "p-4")}>
          {renderNavItems(isCollapsed)}
        </div>

        <div className={cn("border-t border-border flex items-center shrink-0", isCollapsed ? "p-3 flex-col gap-2 justify-center" : "p-4 justify-between")}>
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
