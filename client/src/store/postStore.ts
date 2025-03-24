// src/store/postStore.ts
import { Post, User, Comment } from "@/utils/types";
import { create } from "zustand";

interface PostState {
  posts: Post[];
  setPosts: (posts: Post[]) => void; // New action to set posts from API
  deletePost: (postId: string) => void;
  addComment: (postId: string, content: string, user: User) => void;
  editComment: (postId: string, commentId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
}

export const usePostStore = create<PostState>()((set, get) => ({
  // Initialize posts as an empty array (no dummy data)
  posts: [],

  // Action to set posts from API
  setPosts: (posts: Post[]) => {
    set({ posts });
  },

  // Delete a post
  deletePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },

  // Add a comment to a post
  addComment: (postId: string, content: string, user: User) => {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      content,
      user,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ),
    }));
  },

  // Edit a comment
  editComment: (postId: string, commentId: string, content: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      content,
                      timestamp: new Date().toISOString(),
                    }
                  : comment
              ),
            }
          : post
      ),
    }));
  },

  // Delete a comment
  deleteComment: (postId: string, commentId: string) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== commentId
              ),
            }
          : post
      ),
    }));
  },
}));
