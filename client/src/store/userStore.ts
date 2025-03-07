import { User } from "@/utils/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      logout: () => set({ user: null }),
    }),
    { name: "user-storage" }
  )
);
