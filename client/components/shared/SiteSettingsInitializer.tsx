"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/lib/settings-store";
import { setActiveSiteSettings } from "@/config/site";
import type { SiteSettingsDto } from "@ggm/types";
import { api } from "@/lib/api/client";

export function SiteSettingsInitializer({
  initialSettings,
}: {
  initialSettings?: SiteSettingsDto | null;
}) {
  const initialized = useRef(false);

  // Synchronously seed store on render
  if (!initialized.current && initialSettings) {
    setActiveSiteSettings(initialSettings);
    useSettingsStore.getState().setSettings(initialSettings);
    initialized.current = true;
  }

  useEffect(() => {
    if (initialSettings) {
      setActiveSiteSettings(initialSettings);
      useSettingsStore.getState().setSettings(initialSettings);
    } else {
      api.settings
        .get()
        .then(({ data }) => {
          if (data) {
            setActiveSiteSettings(data);
            useSettingsStore.getState().setSettings(data);
          }
        })
        .catch(() => {
          // Graceful fallback to default configuration
        });
    }
  }, [initialSettings]);

  return null;
}
