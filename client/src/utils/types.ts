// src/components/types.ts
export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: User;
  backgroundColor: string;
  coverPic?: string;
  joinCode?: string;
  inviteLink?: string;
  isPrivate?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  initial: string;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  timestamp: string;
}

export interface Post {
  id: string;
  content: string;
  attachments: File[];
  timestamp: string;
  comments: Comment[];
  user: User;
}
