// src/store/notificationStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Notification {
  id: string;
  type: "chat" | "video_call" | "class_post";
  classId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (notificationId: string) => void;
  getUnreadCountForClass: (classId: string) => number;
  getTotalUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Dummy notifications
      notifications: [
        {
          id: "1",
          type: "chat",
          classId: "react-101",
          message: "New message from Sarah in React Development",
          timestamp: "2025-03-02T10:00:00Z",
          read: false,
        },
        {
          id: "2",
          type: "class_post",
          classId: "react-101",
          message: "New post: Assignment 1 due tomorrow in React Development",
          timestamp: "2025-03-02T10:05:00Z",
          read: false,
        },
        {
          id: "3",
          type: "video_call",
          classId: "ui-303",
          message: "Video call request from Priya in UI/UX Design",
          timestamp: "2025-03-02T10:10:00Z",
          read: false,
        },
        {
          id: "4",
          type: "class_post",
          classId: "ts-202",
          message: "New post: Quiz 2 posted in TypeScript Mastery",
          timestamp: "2025-03-02T10:15:00Z",
          read: true,
        },
      ],
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
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
        get().notifications.filter((n) => n.classId === classId && !n.read).length,
      getTotalUnreadCount: () =>
        get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);