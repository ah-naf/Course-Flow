import axiosInstance from "@/api/axiosInstance";
import { Course, CoursePreview, User } from "@/utils/types";
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

interface CreateCourseFormData {
  id: string;
  name: string;
  description: string;
  cover_pic: File | undefined; // Can be a File object or filename string
}

interface CourseSetting {
  id: string;
  name: string;
  description: string;
  background_color: string;
  cover_pic?: File;
  join_code: string;
  post_permission: number;
  is_private: boolean;
}

export const useUpdateClassSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedSettings: CourseSetting) => {
      const formData = new FormData();

      formData.append("id", updatedSettings.id);
      formData.append("join_code", updatedSettings.join_code);
      formData.append("name", updatedSettings.name);
      formData.append("description", updatedSettings.description || "");
      formData.append("background_color", updatedSettings.background_color);
      formData.append("is_private", String(updatedSettings.is_private));
      formData.append(
        "post_permission",
        String(updatedSettings.post_permission)
      );

      if (updatedSettings.cover_pic instanceof File) {
        formData.append("cover_pic", updatedSettings.cover_pic);
      }

      await axiosInstance.put(`/courses/${updatedSettings.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return updatedSettings;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh course-related data
      queryClient.invalidateQueries({ queryKey: ["courses", false] });
      queryClient.invalidateQueries({ queryKey: ["courses", true] });
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });
      queryClient.invalidateQueries({
        queryKey: ["coursePreview", data.join_code],
      });

      toast.success("Class settings updated successfully!", {
        description: `Settings for "${
          data?.name || "course"
        }" have been saved.`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to update class settings", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to update class settings", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

export const useCoursePreview = (course_joincode: string | undefined) => {
  return useQuery<CoursePreview, Error>({
    queryKey: ["coursePreview", course_joincode],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `/courses/preview/${course_joincode}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error?: string }>;
          // Throw error with message so that it will be in the `error` property.
          throw new Error(
            axiosError.response?.data?.error || "Course not found"
          );
        } else {
          throw new Error("An unknown error occurred");
        }
      }
    },
    enabled: Boolean(course_joincode),
    retry: 1,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateCourseFormData) => {
      // Create FormData object for multipart/form-data request
      const data = new FormData();
      data.append("id", formData.id);
      data.append("name", formData.name);
      data.append("description", formData.description || "");
      if (formData.cover_pic) data.append("cover_pic", formData.cover_pic);

      // Using a demo endpoint - in a real app, this would be your actual API endpoint
      const response = await axiosInstance.post("/courses", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh course lists
      queryClient.invalidateQueries({ queryKey: ["courses", false] });
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });

      toast.success("Course created successfully!", {
        description: `Your new course "${
          data?.name || "course"
        }" has been created.`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to create course", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to create course", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

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
  idToKick?: string;
}

export const useLeaveCourse = (kick: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      courseName,
      idToKick,
    }: LeaveCourseMutationVars) => {
      if (!kick) await axiosInstance.delete(`/courses/leave/${courseId}`);
      else
        await axiosInstance.delete(`/courses/leave/${courseId}`, {
          data: { id: idToKick },
        });
      // Return the course name to use in the success handler
      return { courseName, kick, courseId };
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      if (!data.kick) {
        queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
        queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
        queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });

        // Show success toast with course name
        toast.success(`Left "${data.courseName}" successfully`, {
          description:
            "You can rejoin this course using the join code if needed.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["members", data.courseId] });
        toast.success(`Member kicked from "${data.courseName}"`, {
          description: "The member has been removed from the course.",
        });
      }
    },
    onError: (error, variables) => {
      // Check if it's an Axios error and safely cast it
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error(
          `Failed to ${kick ? "kick member from" : "leave"} "${
            variables.courseName
          }"`,
          {
            description:
              axiosError.response?.data?.error || "An unknown error occurred",
          }
        );
      } else {
        toast.error(
          `Failed to ${kick ? "kick member from" : "leave"} "${
            variables.courseName
          }"`,
          {
            description: "An unknown error occurred",
          }
        );
      }
    },
  });
};
