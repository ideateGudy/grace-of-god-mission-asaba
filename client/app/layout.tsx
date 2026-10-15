import type { Metadata, Viewport } from "next";
import { Newsreader, Figtree } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Grace of God Mission Asaba", template: "%s | Grace of God Mission Asaba" },
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
    siteName: "Grace of God Mission Asaba",
    title: "Grace of God Mission Asaba",
    description: "Service information, sermons, events, and ways to connect with Grace of God Mission Asaba.",
    images: [
      {
        url: "/ggm_logo.png",
        width: 1280,
        height: 1280,
        alt: "Grace of God Mission Asaba Emblem",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D22" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" suppressHydrationWarning className={cn("antialiased", newsreader.variable, figtree.variable, "font-sans")}>
      <body>
        <ThemeProvider>
          <MotionProvider>
            {children}
            <Toaster />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
