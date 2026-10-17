import {
  Church,
  MapPin,
  Image as ImageIcon,
  Video,
  CalendarDays,
  Megaphone,
  Building2,
  HeartHandshake,
  Mail,
  Radio,
  BookOpen,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    title: "About Us",
    items: [
      {
        title: "About the Church",
        href: "/about",
        description: "Vision, mission, leadership & doctrine",
        icon: Church,
      },
      {
        title: "Plan Your Visit",
        href: "/visit",
        description: "Service times, directions & what to expect",
        icon: MapPin,
      },
      {
        title: "Photo Gallery",
        href: "/gallery",
        description: "Moments of worship, fellowship & community",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "Word & Worship",
    items: [
      {
        title: "Live Broadcast",
        href: "/live",
        description: "Stream our sanctuary services in real time",
        icon: Radio,
      },
      {
        title: "Sermons",
        href: "/sermons",
        description: "Watch & listen to uplifting gospel messages",
        icon: Video,
      },
      {
        title: "Daily Devotion",
        href: "/devotion",
        description: "Start your day with Scripture, reflection & prayer",
        icon: BookOpen,
      },
      {
        title: "Events",
        href: "/events",
        description: "Upcoming programs, conferences & services",
        icon: CalendarDays,
      },
      {
        title: "Announcements",
        href: "/announcements",
        description: "Weekly bulletins, events & church updates",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "Community & Care",
    items: [
      {
        title: "Church Projects",
        href: "/projects",
        description: "Kingdom building & community outreach",
        icon: Building2,
      },
      {
        title: "Prayer Wall",
        href: "/prayer/wall",
        description: "Intercede together as a family of faith",
        icon: HeartHandshake,
      },
      {
        title: "Testimonies",
        href: "/testimonies",
        description: "Stories of God's power and faithfulness",
        icon: Sparkles,
      },
      {
        title: "Prayer Request",
        href: "/prayer",
        description: "Confidential petitions to our pastoral team",
        icon: HeartHandshake,
      },
      {
        title: "Contact Us",
        href: "/contact",
        description: "Office lines, email, directions & enquiries",
        icon: Mail,
      },
    ],
  },
];
