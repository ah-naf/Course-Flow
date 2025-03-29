import axiosInstance from "@/api/axiosInstance";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead, notifications } = useNotificationStore();

  return useMutation<void, Error, string>({
    mutationFn: async (notificationId: string) => {
      const response = await axiosInstance.post(
        `/notifications/read?id=${notificationId}`
      );
      return response.data;
    },
    onSuccess: (_, notificationId) => {
      markAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      let message = "Failed to mark notification as read";
      if (error instanceof AxiosError) {
        message = error.response?.data?.error || message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { setNotifications, notifications } = useNotificationStore();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      let message = "Failed to mark all notifications as read";
      if (error instanceof AxiosError) {
        message = error.response?.data?.error || message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { setNotifications } = useNotificationStore();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await axiosInstance.post("/notifications/clear");
      return response.data;
    },
    onSuccess: () => {
      setNotifications([]);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications cleared");
    },
    onError: (error) => {
      let message = "Failed to clear all notifications";
      if (error instanceof AxiosError) {
        message = error.response?.data?.error || message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

// Update useGetNotifications to include toast for errors
export const useGetNotifications = () => {
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  return useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/notifications");
        if (!response.data) return [];

        const fetchedNotifications = response.data.map(
          (notif: Notification) => ({
            ...notif,
            read: notif.read ?? false,
          })
        );
        setNotifications(fetchedNotifications);
        return fetchedNotifications;
      } catch (error) {
        let message = "Failed to fetch notifications";
        if (error instanceof AxiosError) {
          message = error.response?.data?.error || message;
        }
        toast.error(message);
        throw new Error(message); // Re-throw to maintain query error state
      }
    },
    retry: 1,
  });
};
