import { User } from "@/utils/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Create the Zustand store with persistence
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null, // Initial state: no user
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem("user-storage");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      },
    }),
    { name: "user-storage", storage: createJSONStorage(() => localStorage) }
  )
);
