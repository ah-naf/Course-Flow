import React, { useState, useRef } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X } from "lucide-react";
import { MDXEditor, MDXEditorMethods } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { Post, Attachment } from "@/utils/types";
import { useEditPost } from "@/hooks/usePost";

// Define a type that can be either an existing Attachment or a new File
type MixedAttachment = Attachment | File;

interface EditPostDialogProps {
  onOpenChange: (open: boolean) => void;
  post: Post;
}

export const EditPostDialog: React.FC<EditPostDialogProps> = ({
  onOpenChange,
  post,
}) => {
  const editPostMutation = useEditPost(post.course_id);
  const [postContent, setPostContent] = useState(post.content);

  // Use MixedAttachment type for state
  const [postAttachments, setPostAttachments] = useState<MixedAttachment[]>(
    post.attachments || []
  );

  const editorRef = useRef<MDXEditorMethods>(null);

  // Handle file input for attachments
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPostAttachments((prev) => [...prev, ...Array.from(files)]);
    }
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setPostAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle post submission
  const handleSubmitEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return; // Prevent empty posts

    editPostMutation.mutate(
      {
        postID: post.id,
        content: postContent,
        attachments: postAttachments,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  // Helper function to determine if an attachment is a File or Attachment
  const isFile = (attachment: MixedAttachment): attachment is File => {
    return attachment instanceof File;
  };

  return (
    <DialogContent className="sm:max-w-[800px] w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-2xl sm:text-3xl font-semibold">
          Edit Post
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base text-gray-600">
          Update the post content and attachments.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmitEditPost} className="space-y-6 mt-6">
        <div>
          <label
            htmlFor="postContent"
            className="text-sm sm:text-base font-medium text-gray-700"
          >
            Post Content
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </label>
          <div className="mt-2">
            <MDXEditor
              ref={editorRef}
              markdown={postContent}
              onChange={(markdown) => setPostContent(markdown)}
              placeholder="Write your post here... (supports Markdown)"
              className="border rounded-md min-h-[250px]"
              contentEditableClassName="min-h-[220px] px-3 py-2 focus:outline-none prose prose-sm"
              plugins={[
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <BlockTypeSelect />
                      <CreateLink />
                      <ListsToggle />
                    </>
                  ),
                }),
              ]}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="attachments"
            className="text-sm sm:text-base font-medium text-gray-700"
          >
            Attachments
          </label>
          <div className="mt-2 flex items-center flex-wrap gap-2">
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="hidden"
              aria-describedby="attachmentsHelp"
            />
            <label
              htmlFor="attachments"
              className="cursor-pointer inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-500" />
              Upload Files
            </label>
            {postAttachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 rounded-md p-2 text-sm text-gray-700"
              >
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {isFile(attachment)
                    ? attachment.name
                    : attachment.document.file_name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                  aria-label={`Remove ${
                    isFile(attachment)
                      ? attachment.name
                      : attachment.document.file_name
                  }`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <p
            id="attachmentsHelp"
            className="mt-1 text-xs sm:text-sm text-gray-500"
          >
            Upload any files to share with your class (optional).
          </p>
        </div>
        <Button
          type="submit"
          className="w-full text-sm sm:text-base py-2 sm:py-3"
        >
          Update Post
        </Button>
      </form>
    </DialogContent>
  );
};
