// src/store/postStore.ts
import { Post } from "@/utils/types";
import { create } from "zustand";

interface PostState {
  posts: Post[];
  setPosts: (posts: Post[]) => void; // New action to set posts from API
  deletePost: (postId: string) => void;
}

export const usePostStore = create<PostState>()((set, get) => ({
  // Initialize posts as an empty array (no dummy data)
  posts: [],

  // Action to set posts from API
  setPosts: (posts: Post[]) => {
    const sortedPosts = [...posts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    set({ posts: sortedPosts });
  },

  // Delete a post
  deletePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },
}));
