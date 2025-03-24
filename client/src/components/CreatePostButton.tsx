// src/components/CreatePostButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Loader } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";
import { Progress } from "@/components/ui/progress";
import { useCreatePost } from "@/hooks/usePost";

interface CreatePostButtonProps {
  courseID: string;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  courseID,
}) => {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Use the createPost mutation
  const createPostMutation = useCreatePost(courseID);

  const handleSubmitPost = async (content: string, attachments: File[]) => {
    // Start showing the progress bar
    setIsUploading(true);
    setUploadProgress(0);

    // Close the dialog as we'll show progress outside
    setIsPostDialogOpen(false);

    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const nextProgress = prev + 5;
        return nextProgress > 90 ? 90 : nextProgress; // Cap at 90% until complete
      });
    }, 300);

    try {
      // Call the mutation to create the post
      await createPostMutation.mutateAsync({
        content: content,
        files: attachments,
      });

      // Set progress to 100% when complete
      setUploadProgress(100);

      // Hide progress bar after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);
    } catch (error) {
      console.error("Error creating post:", error);
      // Show error in progress container
      setUploadProgress(0);
      // Keep the container visible to show error message
      // We'll clear this after a timeout
      setTimeout(() => {
        setIsUploading(false);
      }, 3000);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="mb-8 space-y-2">
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-16 text-left flex items-center justify-start text-gray-500 hover:bg-gray-100 cursor-pointer"
            disabled={isUploading}
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Write a post...
          </Button>
        </DialogTrigger>
        <CreatePostDialog
          isOpen={isPostDialogOpen}
          onOpenChange={setIsPostDialogOpen}
          onSubmit={handleSubmitPost}
          courseID={courseID}
        />
      </Dialog>

      {/* Progress Container - Shows below the button when uploading */}
      {isUploading && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm">
              {uploadProgress < 100
                ? "Creating post..."
                : "Post created successfully!"}
            </h3>
            {uploadProgress < 100 && (
              <Loader className="h-4 w-4 animate-spin text-gray-500" />
            )}
          </div>

          <Progress value={uploadProgress} className="h-2 mb-2" />

          <p className="text-xs text-gray-500">
            {uploadProgress < 100
              ? "Uploading files and creating your post..."
              : "Your post has been published successfully!"}
          </p>

          {createPostMutation.isError && (
            <p className="text-xs text-red-500 mt-1">
              Error creating post. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
