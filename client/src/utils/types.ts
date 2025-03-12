// src/components/types.ts
export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: User;
  background_color: string;
  cover_pic?: string;
  joinCode?: string;
  updated_at?: string;
  post_permission: string;
  role: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
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

export interface ChatMessage {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
}

export interface GroupMember extends User {
  role: "Instructor" | "Moderator" | "Member";
}

export interface FileStorage {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
