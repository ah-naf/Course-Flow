// src/components/EditCommentDialog.tsx
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Comment } from "@/utils/types";

interface EditCommentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comment: Comment;
  onSubmit: (commentId: string, content: string) => void;
}

export const EditCommentDialog: React.FC<EditCommentDialogProps> = ({
  isOpen,
  onOpenChange,
  comment,
  onSubmit,
}) => {
  const [commentText, setCommentText] = useState(comment.content);

  // Handle comment submission
  const handleSubmitEditComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return; // Prevent empty comments

    onSubmit(comment.id, commentText);
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[600px] w-[90vw] rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-2xl sm:text-3xl font-semibold">
          Edit Comment
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base text-gray-600">
          Update your comment below.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmitEditComment} className="space-y-6 mt-6">
        <div>
          <label
            htmlFor="commentContent"
            className="text-sm sm:text-base font-medium text-gray-700"
          >
            Comment
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </label>
          <div className="mt-2">
            <Input
              id="commentContent"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="w-full text-sm"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-sm sm:text-base py-2 sm:py-3"
          disabled={!commentText.trim()}
        >
          Update Comment
        </Button>
      </form>
    </DialogContent>
  );
};
