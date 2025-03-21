import axiosInstance from "@/api/axiosInstance";
import { GroupMember } from "@/utils/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const useChangeRole = (courseID: string) => {
  return useMutation({
    mutationFn: async ({
      member_id,
      role,
    }: {
      member_id: string;
      role: number;
    }) => {
      const response = await axiosInstance.put(
        `/members/change-role/${courseID}`,
        {
          member_id,
          role,
        }
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Role updated successfully", {
        description: "The member's role has been changed.",
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        toast.error(
          axiosError.response?.data.error ||
            "An error occurred while updating the role",
          {
            description:
              "Please try again or contact support if the issue persists.",
          }
        );
      }
    },
  });
};

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
