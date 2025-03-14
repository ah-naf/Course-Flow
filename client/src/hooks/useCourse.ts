import axiosInstance from "@/api/axiosInstance";
import { Course, User } from "@/utils/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface CourseResponse extends Course {
  admin: User;
}

export const useJoinCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (joinCode: string) => {
      await axiosInstance.post(`/courses/join`, {
        course_id: joinCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      toast.success("Successfully joined the course!");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Unable to join the course", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Unable to join the course", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

export const useFetchCourse = (
  archived: boolean = false
): UseQueryResult<CourseResponse[], Error> => {
  return useQuery<CourseResponse[], Error>({
    queryKey: ["courses", archived],
    queryFn: async () => {
      const response = await axiosInstance.get("/courses", {
        params: { archived },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useFetchTeachingCourses = (): UseQueryResult<
  CourseResponse[],
  Error
> => {
  return useQuery<CourseResponse[], Error>({
    queryKey: ["teachingCourses"],
    queryFn: async () => {
      const response = await axiosInstance.get("/courses/instructor");
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useArchiveCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      await axiosInstance.put(`/courses/archive`, {
        course_id: courseId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });
      toast.success("Course archived successfully!");
    },
    onError: (error) => {
      // Check if it's an Axios error and safely cast it
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to archive course", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to archive course", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

export const useRestoreCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      await axiosInstance.put(`/courses/restore`, {
        course_id: courseId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });
      toast.success("Course restored successfully!");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to restore course", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to restore course", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      await axiosInstance.delete(`/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });
      toast.success("Course deleted successfully!");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to delete course", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to delete course", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

interface LeaveCourseMutationVars {
  courseId: string;
  courseName: string;
}

export const useLeaveCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, courseName }: LeaveCourseMutationVars) => {
      await axiosInstance.delete(`/courses/leave/${courseId}`);

      // Return the course name to use in the success handler
      return { courseName };
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });

      // Show success toast with course name
      toast.success(`Left "${data.courseName}" successfully`, {
        description:
          "You can rejoin this course using the join code if needed.",
      });
    },
    onError: (error, variables) => {
      // Check if it's an Axios error and safely cast it
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error(`Failed to leave "${variables.courseName}"`, {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error(`Failed to leave "${variables.courseName}"`, {
          description: "An unknown error occurred",
        });
      }
    },
  });
};
