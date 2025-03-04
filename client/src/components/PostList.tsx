// src/components/PostList.tsx
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PostCard } from "./PostCard.tsx";
import { Course, Post } from "@/utils/types";
import { usePostStore } from "@/store/postStore";

interface PostListProps {
  course: Course;
  classId: string;
}

export const PostList: React.FC<PostListProps> = ({ course, classId }) => {
  const {
    posts,
    editPost,
    deletePost,
    addComment,
    editComment,
    deleteComment,
    getPostLink,
    getCommentLink,
  } = usePostStore();

  const handleEditPost = (
    postId: string,
    content: string,
    attachments: File[]
  ) => {
    editPost(postId, content, attachments);
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const handleCopyPostLink = (postId: string) => {
    const postLink = getPostLink(classId || "", postId);
    navigator.clipboard.writeText(postLink);
    console.log(`Copied post link: ${postLink}`);
  };

  const handleAddComment = (postId: string, content: string) => {
    addComment(postId, content, {
      id: "current-user",
      name: "You",
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

  const handleCopyCommentLink = (postId: string, commentId: string) => {
    const commentLink = getCommentLink(classId || "", postId, commentId);
    navigator.clipboard.writeText(commentLink);
    console.log(`Copied comment link: ${commentLink}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Posts</h2>
      {posts.length === 0 ? (
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
              onCopyPostLink={handleCopyPostLink}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onCopyCommentLink={handleCopyCommentLink}
            />
          ))}
        </div>
      )}
    </div>
  );
};
