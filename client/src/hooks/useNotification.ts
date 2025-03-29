import axiosInstance from "@/api/axiosInstance";
import { useNotificationStore } from "@/store/notificationStore";
import { Notification } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

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
            read: notif.read ?? false, // Ensure read property exists, default to false
          })
        );
        setNotifications(fetchedNotifications); // Update the store
        return fetchedNotifications;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error?: string }>;
          throw new Error(
            axiosError.response?.data?.error || "Failed to fetch notifications"
          );
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    retry: 1, // Retry once on failure
  });
};
