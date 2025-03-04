// src/components/PostCard.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Image as ImageIcon,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Dialog } from "@/components/ui/dialog";
import { EditPostDialog } from "./EditPostDialog";
import { CommentSection } from "./CommentSection";
import { Course, Post } from "@/utils/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

interface PostCardProps {
  post: Post;
  course: Course;
  classId: string;
  onAddComment: (postId: string, content: string) => void;
  onEditPost: (postId: string, content: string, attachments: File[]) => void;
  onDeletePost: (postId: string) => void;
  onCopyPostLink: (postId: string) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCopyCommentLink: (postId: string, commentId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  course,
  classId,
  onAddComment,
  onEditPost,
  onDeletePost,
  onCopyPostLink,
  onEditComment,
  onDeleteComment,
  onCopyCommentLink,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="border border-gray-200 rounded-lg">
      <CardContent className="pt-2 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-gray-200">
              <AvatarImage src={post.user.avatar || "/api/placeholder/40/40"} />
              <AvatarFallback
                className="text-white text-sm"
                style={{ backgroundColor: course.backgroundColor }}
              >
                {post.user.initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.name}</p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(post.timestamp)}
              </p>
            </div>
          </div>
          {/* Post Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                aria-label="Post options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsEditDialogOpen(true)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeletePost(post.id)}
                className="cursor-pointer text-red-500 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCopyPostLink(post.id)}
                className="cursor-pointer"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        {post.attachments.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Attachments
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-md p-2 text-sm text-gray-700 flex items-center"
                  >
                    <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <CommentSection
          comments={post.comments}
          postId={post.id}
          classId={classId}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onCopyCommentLink={onCopyCommentLink}
          backgroundColor={course.backgroundColor}
        />

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditPostDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            post={post}
            onSubmit={onEditPost}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
};
