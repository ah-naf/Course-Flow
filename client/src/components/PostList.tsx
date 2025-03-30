// src/components/PostList.tsx
import React, { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner"; // Import sonner for toast notifications
import { PostCard } from "./PostCard";
import { Course } from "@/utils/types";
import { usePostStore } from "@/store/postStore";
import { useDeletePost, useGetAllPost } from "@/hooks/usePost"; // Import the query hook
import { useNotificationStore } from "@/store/notificationStore";

interface PostListProps {
  course: Course;
  classId: string;
}

export const PostList: React.FC<PostListProps> = ({ course, classId }) => {
  const { posts, setPosts } = usePostStore();
  const { currentPostNotification, setCurrentPostNotification } =
    useNotificationStore();

  // Fetch posts using the useGetAllPost hook
  const {
    data: fetchedPosts,
    isLoading,
    error,
    refetch,
  } = useGetAllPost(course.id);
  const { mutate: deletePostMutation } = useDeletePost(course.id);

  // Update the store with fetched posts when data changes
  useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts, setPosts]);

  // Display error message using sonner toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch posts", {
        description: error.message,
        duration: 5000, // Show for 5 seconds
      });
    }
  }, [error]);

  const handleDeletePost = (postId: string) => {
    deletePostMutation(postId);
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-4">Posts</h2>
      {currentPostNotification?.classId === course.id && (
        <div className="sticky -top-6 z-50 flex justify-center py-2">
          <button
            onClick={() => {
              refetch();
              setCurrentPostNotification(undefined);
            }}
            className="transition transform hover:scale-105 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            Load New Posts
          </button>
        </div>
      )}
      {isLoading ? (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertDescription className="text-center py-8 text-gray-500">
            Loading posts...
          </AlertDescription>
        </Alert>
      ) : posts.length === 0 ? (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertDescription className="text-center py-8 text-gray-500">
            No posts yet. Create a post to get started!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, course_id: course.id }}
              course={course}
              classId={classId}
              onDeletePost={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};
