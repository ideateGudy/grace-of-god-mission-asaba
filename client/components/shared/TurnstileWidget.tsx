"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({ onVerify, onExpire, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  // Cloudflare test sitekey that always passes in development / testing if none provided
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.turnstile) {
      setLoaded(true);
      return;
    }

    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkLoaded = () => {
      if (window.turnstile) {
        setLoaded(true);
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    checkLoaded();
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.turnstile) return;

    // Reset previous widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: resolvedTheme === "dark" ? "dark" : "light",
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
      });
      widgetIdRef.current = id;
    } catch (err) {
      console.warn("Turnstile render error", err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [loaded, siteKey, resolvedTheme, onVerify, onExpire]);

  return (
    <div className={className}>
      <div ref={containerRef} className="min-h-[65px] flex items-center" />
    </div>
  );
}
