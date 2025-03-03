// src/pages/ClassPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X, Edit2, Copy, Check, Lock, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import { MDXEditor } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import MDXEditor toolbar components
import {
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  toolbarPlugin,
  MDXEditorMethods,
} from "@mdxeditor/editor";

// Define the type for a course
interface Course {
  id: string;
  name: string;
  description: string;
  instructor: { name: string; avatar: string; initial: string };
  backgroundColor: string;
  coverPic?: string;
  joinCode?: string;
  inviteLink?: string;
  isPrivate?: boolean; // Added to control visibility of join details
}

// Define the type for a post
interface Post {
  id: string;
  content: string; // Markdown content
  attachments: File[];
  timestamp: string;
}

const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // Dummy data for the course
  const allCourses: Course[] = [
    {
      id: "react-101",
      name: "React Development",
      description:
        "Learn the fundamentals of React, including components, state management, and hooks.",
      instructor: { name: "Sarah Johnson", avatar: "", initial: "S" },
      backgroundColor: "#4CAF50",
      coverPic: "https://via.placeholder.com/1200x400?text=React+Development",
      joinCode: "RCT-DEV-2025",
      inviteLink: "https://yourapp.com/join/react-101",
      isPrivate: false, // Not private, so join details are visible
    },
    {
      id: "ui-303",
      name: "UI/UX Design",
      description:
        "Master the art of designing intuitive and visually appealing user interfaces.",
      instructor: { name: "Priya Patel", avatar: "", initial: "P" },
      backgroundColor: "#9C27B0",
      coverPic: "https://via.placeholder.com/1200x400?text=UI/UX+Design",
      joinCode: "UIX-303-2025",
      inviteLink: "https://yourapp.com/join/ui-303",
      isPrivate: false,
    },
    {
      id: "ts-202",
      name: "TypeScript Mastery",
      description:
        "Deep dive into TypeScript, focusing on advanced types, interfaces, and best practices.",
      instructor: { name: "Michael Chen", avatar: "", initial: "M" },
      backgroundColor: "#2196F3",
      coverPic: "https://via.placeholder.com/1200x400?text=TypeScript+Mastery",
      joinCode: "TS-MST-2025",
      inviteLink: "https://yourapp.com/join/ts-202",
      isPrivate: false,
    },
    {
      id: "node-404",
      name: "Node.js Backend",
      description:
        "Build scalable backend applications using Node.js, Express, and MongoDB.",
      instructor: { name: "Carlos Rodriguez", avatar: "", initial: "C" },
      backgroundColor: "#FF9800",
      coverPic: "https://via.placeholder.com/1200x400?text=Node.js+Backend",
      joinCode: "NODE-BE-2025",
      inviteLink: "https://yourapp.com/join/node-404",
      isPrivate: false,
    },
  ];

  const course = allCourses.find((c) => c.id === classId);

  if (!course) {
    navigate("/");
    return null;
  }

  // State for creating a post
  const [postContent, setPostContent] = useState("");
  const [postAttachments, setPostAttachments] = useState<File[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isJoinDetailsDialogOpen, setIsJoinDetailsDialogOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]); // Store posts
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const editorRef = React.useRef<MDXEditorMethods>(null);

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
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return; // Prevent empty posts

    const newPost: Post = {
      id: crypto.randomUUID(),
      content: postContent,
      attachments: [...postAttachments],
      timestamp: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]); // Add new post to the top
    setPostContent("");
    setPostAttachments([]);
    setIsPostDialogOpen(false);
  };

  // Copy join code to clipboard
  const copyJoinCode = () => {
    if (course.joinCode) {
      navigator.clipboard.writeText(course.joinCode);
      setCopiedJoinCode(true);
      setTimeout(() => setCopiedJoinCode(false), 2000);
    }
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (course.inviteLink) {
      navigator.clipboard.writeText(course.inviteLink);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 2000);
    }
  };

  // Flag to control visibility of join details (set to true for now)
  const showJoinDetails = !course.isPrivate; // Show if not private

  return (
    <div className="p-6">
      {/* Cover Picture Banner */}
      <div
        className="h-48 sm:h-64 w-full bg-cover bg-center rounded-lg mb-6 relative"
        style={{
          backgroundImage: `url(${
            course.coverPic ||
            "https://via.placeholder.com/1200x400?text=Class+Banner"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-6">
          <div className="w-full flex justify-between items-end">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {course.name}
              </h1>
              <p className="text-white text-sm sm:text-base opacity-90 max-w-2xl">
                {course.description}
              </p>
            </div>
            {/* Trigger Button for Join Details Dialog */}
            {showJoinDetails && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dialog
                      open={isJoinDetailsDialogOpen}
                      onOpenChange={setIsJoinDetailsDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-gray-800"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Join Details</span>
                          <span className="sm:hidden">Join</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] w-[90vw] rounded-lg">
                        <DialogHeader>
                          <DialogTitle className="text-2xl sm:text-3xl font-semibold">
                            Join {course.name}
                          </DialogTitle>
                          <DialogDescription className="text-sm sm:text-base text-gray-600">
                            Share these details with students to join your class.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          {/* Join Code */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-700">
                                Join Code
                              </h4>
                            </div>
                            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                              <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                                {course.joinCode}
                              </code>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={copyJoinCode}
                                      className="flex items-center"
                                    >
                                      {copiedJoinCode ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                      <span className="ml-2 hidden sm:inline">
                                        {copiedJoinCode ? "Copied" : "Copy Code"}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{copiedJoinCode ? "Copied to clipboard!" : "Copy join code"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          {/* Invitation Link */}
                          {showJoinDetails && course.inviteLink && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-700">
                                  Invitation Link
                                </h4>
                                
                              </div>
                              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                                <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono truncate max-w-[200px] sm:max-w-[300px]">
                                  {course.inviteLink}
                                </code>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyInviteLink}
                                        className="flex items-center"
                                      >
                                        {copiedInviteLink ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                        <span className="ml-2 hidden sm:inline">
                                          {copiedInviteLink ? "Copied" : "Copy Link"}
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{copiedInviteLink ? "Copied to clipboard!" : "Copy invitation link"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View class join details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Post Section */}
      <div className="mb-8">
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 text-left flex items-center justify-start text-gray-600 hover:bg-gray-100"
            >
              <Edit2 className="h-5 w-5 mr-2" />
              Write a post...
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-semibold">
                Create a Post
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600">
                Share updates, assignments, or resources with your class. Use
                the toolbar to format your content.
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
              >
                Post
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <Alert className="bg-gray-50 border-gray-200">
            <AlertDescription className="text-center py-8 text-gray-500">
              No posts yet. Create a post to get started!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="border border-gray-200 rounded-lg">
                <CardContent className="pt-6 pb-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-3 ring-2 ring-gray-200">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback
                        className="text-white text-sm"
                        style={{ backgroundColor: course.backgroundColor }}
                      >
                        {course.instructor.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {course.instructor.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPage;