// src/store/notificationStore.ts
import { Notification } from "@/utils/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  getUnreadCountForClass: (classId: string) => number;
  getTotalUnreadCount: () => number;
  setNotifications: (notifications: Notification[]) => void; // New function
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
      },
      markAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        })),
      getUnreadCountForClass: (classId) =>
        get().notifications.filter((n) => n.classId === classId && !n.read)
          .length,
      getTotalUnreadCount: () =>
        get().notifications.filter((n) => !n.read).length,

      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
