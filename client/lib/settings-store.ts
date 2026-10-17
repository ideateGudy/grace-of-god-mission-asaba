"use client";

import { create } from "zustand";
import type { SiteSettingsDto } from "@ggm/types";
import { resolveSiteConfig, setActiveSiteSettings } from "@/config/site";
import { useMemo } from "react";

interface SettingsState {
  settings: SiteSettingsDto | null;
  setSettings: (settings: SiteSettingsDto | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => {
    setActiveSiteSettings(settings);
    set({ settings });
  },
}));

export function useSiteSettings() {
  return useSettingsStore((state) => state.settings);
}

export function useSiteConfig() {
  const settings = useSettingsStore((state) => state.settings);
  return useMemo(() => resolveSiteConfig(settings), [settings]);
}
