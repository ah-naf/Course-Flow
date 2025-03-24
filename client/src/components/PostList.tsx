// src/components/PostList.tsx
import React, { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner"; // Import sonner for toast notifications
import { PostCard } from "./PostCard";
import { Course, Post } from "@/utils/types";
import { usePostStore } from "@/store/postStore";
import { useDeletePost, useGetAllPost } from "@/hooks/usePost"; // Import the query hook

interface PostListProps {
  course: Course;
  classId: string;
}

export const PostList: React.FC<PostListProps> = ({ course, classId }) => {
  const {
    posts,
    setPosts, // Add setPosts from the store
    deletePost,
    addComment,
    editComment,
    deleteComment,
  } = usePostStore();

  // Fetch posts using the useGetAllPost hook
  const { data: fetchedPosts, isLoading, error } = useGetAllPost(course.id);
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

  const handleEditPost = (
    postId: string,
    content: string,
    attachments: File[]
  ) => {
    // TODO: handle edit
  };

  const handleDeletePost = (postId: string) => {
    deletePostMutation(postId);
  };

  const handleAddComment = (postId: string, content: string) => {
    addComment(postId, content, {
      id: "current-user",
      firstName: "You",
      lastName: "",
      username: "You",
      email: "",
      avatar: "",
      initial: "U",
    });
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    content: string
  ) => {
    editComment(postId, commentId, content);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    deleteComment(postId, commentId);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Posts</h2>
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
              post={post}
              course={course}
              classId={classId}
              onAddComment={handleAddComment}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};
