// src/components/CreatePostDialog.tsx
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
import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  quotePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, attachments: File[]) => void;
  courseID: string;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  onSubmit,
}) => {
  const [postContent, setPostContent] = useState("");
  const [postAttachments, setPostAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<MDXEditorMethods>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return; // Prevent empty posts

    setIsSubmitting(true);

    // Pass content and attachments to parent component for handling
    onSubmit(postContent, postAttachments);

    // Reset form state
    setPostContent("");
    setPostAttachments([]);
    setIsSubmitting(false);
  };

  return (
    <DialogContent
      ref={dialogRef}
      className="sm:max-w-[800px] w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg"
    >
      <DialogHeader>
        <DialogTitle className="text-2xl sm:text-3xl font-semibold">
          Create a Post
        </DialogTitle>
        <DialogDescription className="text-sm sm:text-base text-gray-600">
          Share updates, assignments, or resources with your class. Use the
          toolbar to format your content.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmitPost} className="space-y-6 mt-6">
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
                // Core plugins
                headingsPlugin(),
                quotePlugin(),
                listsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),

                // UI toolbar plugin
                toolbarPlugin({
                  toolbarClassName: "list-[unset]",
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
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
            {postAttachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 rounded-md p-2 text-sm text-gray-700"
              >
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(index)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
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
          disabled={isSubmitting || !postContent.trim()}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </form>
    </DialogContent>
  );
};
