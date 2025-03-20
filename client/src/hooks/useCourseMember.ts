import axiosInstance from "@/api/axiosInstance";
import { GroupMember } from "@/utils/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export const useFetchCourseMember = (
  id: string
): UseQueryResult<GroupMember[], Error> => {
  return useQuery<GroupMember[], Error>({
    queryKey: ["members", id],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/members/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error?: string }>;
          // Throw error with message so that it will be in the `error` property.
          throw new Error(
            axiosError.response?.data?.error ||
              "Error on fetching course members"
          );
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};
