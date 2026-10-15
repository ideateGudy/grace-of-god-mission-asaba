import { create } from "zustand";

interface SessionUser {
  id: string; email: string; name: string; role: "SUPER_ADMIN" | "ADMIN";
  permissions: string[];
  mustChangePassword: boolean;
  status?: string;
}

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
