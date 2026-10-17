import type { Metadata, Viewport } from "next";
import { Newsreader, Figtree } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getLiveSiteSettings, setActiveSiteSettings } from "@/config/site";
import { SiteSettingsInitializer } from "@/components/shared/SiteSettingsInitializer";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLiveSiteSettings();
  const name = settings?.churchName || "Grace of God Mission Asaba";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: name, template: `%s | ${name}` },
    description: "Service information, sermons, events, and ways to connect with Grace of God Mission Asaba.",
    icons: {
      icon: [
        { url: "/ggm_logo.png", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/ggm_logo.png",
      apple: "/ggm_logo.png",
    },
    openGraph: {
      type: "website",
      locale: "en_NG",
      siteName: name,
      title: name,
      description: "Service information, sermons, events, and ways to connect with Grace of God Mission Asaba.",
      images: [
        {
          url: "/ggm_logo.png",
          width: 1280,
          height: 1280,
          alt: `${name} Emblem`,
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D22" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getLiveSiteSettings();
  if (initialSettings) {
    setActiveSiteSettings(initialSettings);
  }

  return (
    <html lang="en-NG" suppressHydrationWarning className={cn("antialiased", newsreader.variable, figtree.variable, "font-sans")}>
      <body>
        <ThemeProvider>
          <MotionProvider>
            <SiteSettingsInitializer initialSettings={initialSettings} />
            {children}
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
