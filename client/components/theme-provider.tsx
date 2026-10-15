"use client";

import * as React from "react"
import { ThemeProvider as NextThemes } from "next-themes";

// Suppress React 19 false-positive console warning for next-themes' anti-FOUC inline script
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemes>) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemes>
  );
}
