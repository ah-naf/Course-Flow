// src/components/CommentSection.tsx
import React, { useEffect, useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { EditCommentDialog } from "./EditCommentDialog";
import { Comment, Course } from "@/utils/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import {
  useAddComment,
  useDeleteComment,
  useGetComment,
} from "@/hooks/usePost";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";

interface CommentSectionProps {
  course: Course;
  postId: string;
  background_color: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  course,
  postId,
  background_color,
}) => {
  const {
    data: initialComments = [],
    error,
    isError,
    isLoading,
  } = useGetComment(postId);
  const { currentCommentNotification, setCurrentCommentNotification } =
    useNotificationStore();
  const { user } = useUserStore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const addCommentMutation = useAddComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  useEffect(() => {
    // console.log({ currentCommentNotification, postId, comments });
    if (!currentCommentNotification) return;

    if (postId === currentCommentNotification.data.postID) {
      const temp = currentCommentNotification.data;
      const newComment: Comment = {
        id: temp.commentID,
        content: temp.content,
        user: temp.user,
        timestamp: new Date().toISOString(),
      };
      setComments((prev) => {
        if (!prev) return [];
        return [...prev, newComment];
      });
      setCurrentCommentNotification(undefined);
    }
  }, [currentCommentNotification, postId, comments]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addCommentMutation.mutate(commentText, {
      onSuccess: () => setCommentText(""),
    });
  };

  const handleCommentDelete = (commentID: string) => {
    deleteCommentMutation.mutate(commentID);
  };

  if (isLoading) {
    return (
      <div className={cn("mt-4 animate-pulse")}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("mt-4")}>
        <Separator className="my-4" />
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            {error?.message || "Failed to load comments"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Separator className="my-4" />
      <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
        Comments ({comments ? comments.length : 0})
      </h4>

      <div className="space-y-4 mb-6">
        {!comments || comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback
                  className="text-white text-sm"
                  style={{ backgroundColor: background_color }}
                >
                  {comment.user.initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">
                          {comment.user.firstName} {comment.user.lastName}
                        </p>
                        <span className="text-xs text-gray-500">
                          @{comment.user.username}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(comment.timestamp)}
                      </span>
                      {(comment.user.id == user?.id ||
                        user?.id === course.admin.id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {comment.user.id === user?.id && (
                              <DropdownMenuItem
                                onClick={() => setEditCommentId(comment.id)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            )}
                            {(comment.user.id === user?.id ||
                              user?.id === course.admin.id) && (
                              <DropdownMenuItem
                                onClick={() => handleCommentDelete(comment.id)}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 mt-2">
                    {comment.content}
                  </p>
                </div>
              </div>
              {editCommentId === comment.id && (
                <Dialog
                  open={!!editCommentId}
                  onOpenChange={() => setEditCommentId(null)}
                >
                  <EditCommentDialog
                    isOpen={!!editCommentId}
                    onOpenChange={() => setEditCommentId(null)}
                    comment={comment}
                    postID={postId}
                  />
                </Dialog>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="flex items-center gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback
            className="text-white text-sm font-semibold"
            style={{ backgroundColor: background_color }}
          >
            {user?.firstName[0]}
            {user?.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full pr-10 text-sm rounded-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={!commentText.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
