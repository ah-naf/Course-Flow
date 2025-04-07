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
import { Image as ImageIcon, MoreVertical, Edit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Dialog } from "@/components/ui/dialog";
import { EditPostDialog } from "./EditPostDialog";
import { CommentSection } from "./CommentSection";
import { Course, Post } from "@/utils/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { useUserStore } from "@/store/userStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: Post;
  course: Course;
  classId: string;
  onDeletePost: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  course,
  onDeletePost,
}) => {
  const { user } = useUserStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="border-none shadow-lg rounded-xl bg-white transition-all hover:shadow-xl">
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-gray-200">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback
                className="text-white text-base font-medium"
                style={{ backgroundColor: course.background_color }}
              >
                {post.user.initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-gray-900">
                  {post.user.firstName} {post.user.lastName}
                </p>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">
                  @{post.user.username}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          {/* Post Options Dropdown */}
          {(post.user_id === user?.id || course.admin.id === user?.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  aria-label="Post options"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg shadow-md border-gray-200"
              >
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer flex items-center space-x-2 py-2 px-3 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                      className="cursor-pointer flex items-center space-x-2 py-2 px-3 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the post and all its comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-md">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeletePost(post.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-md"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Content */}
        <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Attachments Section */}
        {post.attachments && post.attachments.length > 0 && (
          <>
            <Separator className="my-6 bg-gray-200" />
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Attachments
              </h4>
              <div className="flex flex-wrap gap-3">
                {post.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.document.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg p-3 text-sm text-gray-700 transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {attachment.document.file_name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Comment Section */}
        <div className="mt-6">
          <CommentSection
            course={course}
            postId={post.id}
            background_color={course.background_color}
          />
        </div>

        {/* Edit Post Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditPostDialog onOpenChange={setIsEditDialogOpen} post={post} />
        </Dialog>
      </CardContent>
    </Card>
  );
};
