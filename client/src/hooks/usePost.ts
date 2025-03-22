import axiosInstance from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";

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
