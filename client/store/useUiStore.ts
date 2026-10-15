import { create } from "zustand";

interface UiState {
  mobileNavOpen: boolean;
  activeModal: string | null;
  setMobileNavOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  activeModal: null,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setActiveModal: (modal) => set({ activeModal: modal }),
}));
