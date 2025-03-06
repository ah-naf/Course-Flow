// src/components/AddClassDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, X } from "lucide-react";

interface AddClassDialogProps {
  children?: React.ReactNode; // For the DialogTrigger (e.g., the Plus button)
}

const AddClassDialog: React.FC<AddClassDialogProps> = ({ children }) => {
  // State for class creation form
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [coverPic, setCoverPic] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle file input for cover image
  const handleCoverPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPic(file);
    }
  };

  // Handle removing the cover image
  const handleRemoveCoverPic = () => {
    setCoverPic(null);
  };

  // Handle class creation
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating class:", {
      name: className,
      description: classDescription,
      coverPic,
    });
    // Reset form and close dialog
    setClassName("");
    setClassDescription("");
    setCoverPic(null);
    setIsDialogOpen(false);
  };

  // Handle class join
  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Joining class with ID:", classId);
    // Reset form and close dialog
    setClassId("");
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {/* Dialog Trigger (e.g., the Plus button) */}
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
            title="Add New Class"
            aria-label="Add a new class or join an existing one"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[600px] w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-semibold">
            Add a Class
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600">
            Create a new class or join an existing one using a class ID.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="create" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-lg bg-gray-100 p-1">
            <TabsTrigger
              value="create"
              className="text-xs sm:text-sm py-2 sm:py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm truncate"
            >
              Create Class
            </TabsTrigger>
            <TabsTrigger
              value="join"
              className="text-xs sm:text-sm py-2 sm:py-2.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm truncate"
            >
              Join Class
            </TabsTrigger>
          </TabsList>
          {/* Create Class Tab */}
          <TabsContent value="create" className="mt-6">
            <form onSubmit={handleCreateClass} className="space-y-6">
              <div>
                <label
                  htmlFor="classID"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class ID
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <Input
                  id="classID"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Enter a unique id for your class"
                  required
                  className="mt-2 text-sm sm:text-base py-2 sm:py-3"
                  aria-describedby="classIDHelp"
                />
                <p
                  id="classIDHelp"
                  className="mt-1 text-xs sm:text-sm text-gray-500"
                >
                  Give your class a unique id (e.g., "react-101", "node-404").
                </p>
              </div>
              <div>
                <label
                  htmlFor="className"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class Name
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Enter the name of your class"
                  required
                  className="mt-2 text-sm sm:text-base py-2 sm:py-3"
                  aria-describedby="classNameHelp"
                />
                <p
                  id="classNameHelp"
                  className="mt-1 text-xs sm:text-sm text-gray-500"
                >
                  Give your class a descriptive name (e.g., "Introduction to
                  React").
                </p>
              </div>
              <div>
                <label
                  htmlFor="classDescription"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Description
                </label>
                <Textarea
                  id="classDescription"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Describe what this class is about"
                  rows={4}
                  className="mt-2 text-sm sm:text-base py-2 sm:py-3"
                  aria-describedby="classDescriptionHelp"
                />
                <p
                  id="classDescriptionHelp"
                  className="mt-1 text-xs sm:text-sm text-gray-500"
                >
                  Provide a brief overview of the class content (e.g., topics,
                  goals). This field is optional.
                </p>
              </div>
              <div>
                <label
                  htmlFor="coverPic"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Cover Image
                </label>
                <div className="mt-2 flex items-center">
                  <Input
                    id="coverPic"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPicChange}
                    className="hidden"
                    aria-describedby="coverPicHelp"
                  />
                  <label
                    htmlFor="coverPic"
                    className="cursor-pointer inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 rounded-md shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-500" />
                    {coverPic ? "Change Image" : "Upload Image"}
                  </label>
                  {coverPic && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoverPic}
                      className="ml-3 text-gray-500 hover:text-red-500"
                      aria-label="Remove cover image"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {coverPic && (
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(coverPic)}
                      alt="Cover Image Preview"
                      className="h-32 w-full object-contain object-center rounded-md"
                    />
                  </div>
                )}
                <p
                  id="coverPicHelp"
                  className="mt-1 text-xs sm:text-sm text-gray-500"
                >
                  Upload an image to represent your class (optional, PNG/JPG
                  recommended).
                </p>
              </div>
              <Button
                type="submit"
                className="w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Create Class
              </Button>
            </form>
          </TabsContent>
          {/* Join Class Tab */}
          <TabsContent value="join" className="mt-6">
            <form onSubmit={handleJoinClass} className="space-y-6">
              <div>
                <label
                  htmlFor="classId"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class ID
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <Input
                  id="classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="Enter the class ID to join"
                  required
                  className="mt-2 text-sm sm:text-base py-2 sm:py-3"
                  aria-describedby="classIdHelp"
                />
                <p
                  id="classIdHelp"
                  className="mt-1 text-xs sm:text-sm text-gray-500"
                >
                  Enter the unique class ID provided by the instructor (e.g.,
                  "CS101-2024").
                </p>
              </div>
              <Button
                type="submit"
                className="w-full text-sm sm:text-base py-2 sm:py-3"
              >
                Join Class
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddClassDialog;
