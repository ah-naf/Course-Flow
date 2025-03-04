// src/store/postStore.ts
import { Post, User, Comment } from "@/utils/types";
import { create } from "zustand";

interface PostState {
  posts: Post[];
  addPost: (content: string, attachments: File[], user: User) => void;
  editPost: (postId: string, content: string, attachments: File[]) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, content: string, user: User) => void;
  editComment: (postId: string, commentId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  getPostLink: (classId: string, postId: string) => string;
  getCommentLink: (
    classId: string,
    postId: string,
    commentId: string
  ) => string;
}

export const usePostStore = create<PostState>()((set, get) => ({
  // Initial dummy data for posts
  posts: [
    {
      id: "post1",
      content:
        "# Welcome to React Development!\n\nI'm excited to start this journey with all of you. In this course, we'll cover everything from basic React concepts to advanced state management techniques.\n\n**Important dates:**\n- First assignment due: March 15, 2025\n- Midterm project: April 5, 2025\n- Final project: May 20, 2025",
      attachments: [],
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      user: {
        id: "instructor",
        firstName: "aa",
        lastName: "ss",
        avatar: "ff",
        email: "t@t.com",
        username: "Sarah Johnson",
        initial: "S",
      },
      comments: [
        {
          id: "comment1",
          content:
            "Looking forward to the course! Will we be using any specific state management libraries?",
          user: {
            id: "user1",
            firstName: "aa",
            lastName: "ss",
            avatar: "ff",
            email: "t@t.com",
            username: "Alex Smith",
            initial: "A",
          },
          timestamp: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "comment2",
          content:
            "Yes, we'll cover Redux, Context API, and some newer options like Zustand and Jotai.",
          user: {
            id: "instructor",
            firstName: "aa",
            lastName: "ss",
            username: "Sarah Johnson",
            initial: "S",
            email: "t@t.com",
            avatar: "s",
          },
          timestamp: new Date(
            Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
    },
    {
      id: "post2",
      content:
        "## Assignment 1: Component Basics\n\nYour first assignment is to create a simple React application with at least 5 components that demonstrate props, state, and event handling.\n\n**Requirements:**\n- Use functional components with hooks\n- Implement at least one custom hook\n- Include form handling with validation\n- Add basic CSS styling (you can use any CSS approach)",
      attachments: [new File([""], "assignment1_rubric.pdf")],
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      user: {
        id: "instructor",
        firstName: "aa",
        lastName: "ss",
        avatar: "ff",
        email: "t@t.com",
        username: "Sarah Johnson",
        initial: "S",
      },
      comments: [
        {
          id: "comment3",
          content: "Is it okay if we use TypeScript for this assignment?",
          user: {
            id: "user3",
            firstName: "aa",
            lastName: "ss",
            avatar: "ff",
            email: "t@t.com",
            username: "Raj Patel",
            initial: "R",
          },
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "comment4",
          content:
            "Absolutely! TypeScript is encouraged but not required for this assignment.",
          user: {
            id: "instructor",
            firstName: "aa",
            lastName: "ss",
            avatar: "ff",
            email: "t@t.com",
            username: "Sarah Johnson",
            initial: "S",
          },
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "comment5",
          content: "What's the deadline for submitting this assignment?",
          user: {
            id: "user2",
            firstName: "aa",
            lastName: "ss",
            avatar: "ff",
            email: "t@t.com",
            username: "Jamie Wong",
            initial: "J",
          },
          timestamp: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
    },
  ],

  // Add a new post
  addPost: (content: string, attachments: File[], user: User) => {
    const newPost: Post = {
      id: crypto.randomUUID(),
      content,
      attachments: [...attachments],
      timestamp: new Date().toISOString(),
      user,
      comments: [],
    };
    set((state) => ({
      posts: [newPost, ...state.posts],
    }));
  },

  // Edit an existing post
  editPost: (postId: string, content: string, attachments: File[]) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              content,
              attachments: [...attachments],
              timestamp: new Date().toISOString(),
            }
          : post
      ),
    }));
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

  // Get a post link
  getPostLink: (classId: string, postId: string) => {
    return `https://yourapp.com/class/${classId}/post/${postId}`;
  },

  // Get a comment link
  getCommentLink: (classId: string, postId: string, commentId: string) => {
    return `https://yourapp.com/class/${classId}/post/${postId}/comment/${commentId}`;
  },
}));
