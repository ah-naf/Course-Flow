// src/components/CreatePostButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog.tsx";
import { usePostStore } from "@/store/postStore";
import { User } from "@/utils/types";

interface CreatePostButtonProps {
  instructor: User;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({ instructor }) => {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { addPost } = usePostStore();

  const handleSubmitPost = (content: string, attachments: File[]) => {
    addPost(content, attachments, instructor);
    setIsPostDialogOpen(false);
  };

  return (
    <div className="mb-8">
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-16 text-left flex items-center justify-start text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Write a post...
          </Button>
        </DialogTrigger>
        <CreatePostDialog
          isOpen={isPostDialogOpen}
          onOpenChange={setIsPostDialogOpen}
          onSubmit={handleSubmitPost}
        />
      </Dialog>
    </div>
  );
};