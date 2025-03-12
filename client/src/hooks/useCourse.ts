import axiosInstance from "@/api/axiosInstance";
import { Course, User } from "@/utils/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
