import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Updated User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

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
    {
      name: "user-storage", // Key for localStorage
      storage: createJSONStorage(() => localStorage), // Explicitly specify localStorage
    }
  )
);
