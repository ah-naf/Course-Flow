import axiosInstance from "@/api/axiosInstance";
import { Course, User } from "@/utils/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

interface CourseResponse extends Course {
  admin: User;
}

export const fetchCourse = (
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

export const fetchTeachingCourses = (): UseQueryResult<
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

export const archiveCourse = () => {
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
    },
  });
};
