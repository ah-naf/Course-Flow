// src/components/types.ts
export interface Course {
  id: string;
  name: string;
  description: string;
  admin: User;
  background_color: string;
  cover_pic?: string;
  join_code: string;
  created_at?: string;
  updated_at?: string;
  post_permission: number;
  role: number;
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

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  post_id: string;
  document_id: string;
  uploaded_by: string;
  upload_date: string;
  document: Document;
  user?: User;
}

export interface Post {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  attachments: Attachment[];
}

export interface ChatMessage {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
}

export interface GroupMember extends User {
  role: number;
  created_at?: string;
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

export interface CoursePreview extends Course {
  admin: User;
  total_members: number;
  is_private: boolean;
}

export interface Notification {
  id: string;
  type:
    | "post_created"
    | "comment_added"
    | "message_sent"
    | "role_changed"
    | "user_kicked";
  classId: string;
  message: string;
  timestamp: string;
  read: boolean;
  data: any;
}
