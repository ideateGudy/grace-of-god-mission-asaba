import { create } from "zustand";

interface UiState {
  mobileNavOpen: boolean;
  activeModal: string | null;
  heroTextTone: "LIGHT" | "DARK";
  setMobileNavOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  setHeroTextTone: (tone: "LIGHT" | "DARK") => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  activeModal: null,
  heroTextTone: "LIGHT",
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setHeroTextTone: (tone) => set({ heroTextTone: tone }),
}));
