import axiosInstance from "@/api/axiosInstance";
import { usePostStore } from "@/store/postStore";
import { Attachment, Comment, Post } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/v1";

type MixedAttachment = Attachment | File;

interface EditPostData {
  postID: string;
  content: string;
  attachments: MixedAttachment[];
}

export const useGetComment = (postID: string) => {
  return useQuery<Comment[], Error>({
    queryKey: ["comments", postID],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/comment/${postID}`);
      return response.data;
    },
    enabled: !!postID,
  });
};

export const useEditPost = (courseID?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postID, content, attachments }: EditPostData) => {
      const formData = new FormData();
      formData.append("content", content);
      let docs: string[] = [];
      attachments.forEach((a) => {
        let atc: MixedAttachment = a as Attachment;
        if (atc.id !== undefined) docs.push(atc.id);
        atc = a as File;
        if (atc.name !== undefined) formData.append("attachments", atc);
      });
      formData.append("docs", docs.join(","));

      const res = await axiosInstance.put(`/posts/${postID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess: () => {
      console.log(courseID);
      if (courseID) {
        console.log(courseID);
        queryClient.invalidateQueries({ queryKey: ["posts", courseID] });
      }
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to edit post", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
        });
      } else {
        toast.error("Failed to edit post", {
          description: "An unknown error occurred",
        });
      }
    },
  });
};

export const useGetAllAttachments = (courseID: string) => {
  return useQuery<Attachment[], Error>({
    queryKey: ["attachments", courseID], // Unique key for caching
    queryFn: async () => {
      const response = await axiosInstance.get(`/attachments/${courseID}`);
      return response.data;
    },
    enabled: !!courseID, // Only fetch if courseID is provided
  });
};

export const useDeletePost = (courseID: string) => {
  const { setPosts } = usePostStore();
  const queryClient = useQueryClient(); // Access the query client to manage cache

  return useMutation({
    mutationFn: async (postID: string) => {
      await axiosInstance.delete(`/posts/${postID}?course_id=${courseID}`);
      return postID; // Return the postID for use in onSuccess
    },
    // Optimistic update: Remove the post from the store before the API call
    onMutate: async (postID: string) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts", courseID] });

      // Snapshot the previous posts state
      const previousPosts = queryClient.getQueryData<Post[]>([
        "posts",
        courseID,
      ]);

      // Optimistically update the store and query cache
      if (previousPosts) {
        const updatedPosts = previousPosts.filter((post) => post.id !== postID);
        setPosts(updatedPosts); // Update the store
        queryClient.setQueryData(["posts", courseID], updatedPosts); // Update the cache
      }

      // Return the previous state for rollback in case of error
      return { previousPosts };
    },
    // On success, show a success toast
    onSuccess: () => {
      toast.success("Post deleted successfully", {
        duration: 3000,
      });
    },
    // On error, revert to the previous state and show an error toast
    onError: (error, postID, context) => {
      // Revert the store and query cache to the previous state
      if (context?.previousPosts) {
        setPosts(context.previousPosts); // Revert the store
        queryClient.setQueryData(["posts", courseID], context.previousPosts); // Revert the cache
      }

      // Show error toast
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        toast.error("Failed to delete post", {
          description:
            axiosError.response?.data?.error || "An unknown error occurred",
          duration: 5000,
        });
      } else {
        toast.error("Failed to delete post", {
          description: "An unknown error occurred",
          duration: 5000,
        });
      }
    },
    // Always refetch after success or error to ensure the cache is up-to-date
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", courseID] });
    },
  });
};

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
  const queryClient = useQueryClient(); // Access the query client to manage cache

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

      return { ...response.data, courseID };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts", data.courseID] });
    },
  });
};
