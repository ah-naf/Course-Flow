// src/components/CommentSection.tsx
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { EditCommentDialog } from "./EditCommentDialog";
import { Comment } from "@/utils/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  classId: string;
  onAddComment: (postId: string, content: string) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  backgroundColor: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  postId,
  classId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  backgroundColor,
}) => {
  const [commentText, setCommentText] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentText("");
  };

  return (
    <div className="mt-4">
      <Separator className="my-4" />
      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Comments ({comments.length})
      </h4>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={comment.user.avatar || "/api/placeholder/32/32"}
              />
              <AvatarFallback
                className="text-white text-sm"
                style={{ backgroundColor }}
              >
                {comment.user.initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{comment.user.username}</p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(comment.timestamp)}
                  </p>
                </div>
                {/* Comment Options Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Comment options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setEditCommentId(comment.id)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteComment(postId, comment.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
            {/* Edit Comment Dialog */}
            {editCommentId === comment.id && (
              <Dialog
                open={!!editCommentId}
                onOpenChange={() => setEditCommentId(null)}
              >
                <EditCommentDialog
                  isOpen={!!editCommentId}
                  onOpenChange={() => setEditCommentId(null)}
                  comment={comment}
                  onSubmit={(commentId, content) => {
                    onEditComment(postId, commentId, content);
                    setEditCommentId(null);
                  }}
                />
              </Dialog>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmitComment}
        className="flex items-center space-x-2"
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/api/placeholder/32/32" />
          <AvatarFallback
            className="text-white text-xs"
            style={{ backgroundColor }}
          >
            U
          </AvatarFallback>
        </Avatar>
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={!commentText.trim()}
          className="text-primary hover:bg-primary/10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
