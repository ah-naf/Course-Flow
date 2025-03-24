import axiosInstance from "@/api/axiosInstance";
import { Post } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1"

export const useGetAllPost = (courseID: string) => {
  return useQuery<Post[], Error>({
    queryKey: ["posts", courseID], // Unique key for caching
    queryFn: async ({ queryKey }) => {
      const [, courseID] = queryKey; // Destructure courseID from queryKey
      const response = await axios.get(`${API_BASE_URL}/posts/${courseID}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    enabled: !!courseID, // Only fetch if courseID is provided
  });
};

export const useCreatePost = (courseID: string) => {
  return useMutation({
    mutationFn: async ({
      content,
      files,
    }: {
      content: string;
      files?: File[];
    }) => {
      // Create FormData object
      const formData = new FormData();

      // Append content
      formData.append("content", content);

      // Append files if they exist
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Make the POST request
      const response = await axiosInstance.post(
        `/posts/${courseID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
  });
};
