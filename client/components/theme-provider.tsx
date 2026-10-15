"use client";

import * as React from "react"
import { ThemeProvider as NextThemes } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemes>) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemes>
  );
}
