// src/components/AddClassDialog.tsx
import React, { useState, useEffect } from "react";
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
import { useCreateCourse, useJoinCourse } from "@/hooks/useCourse";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { cn } from "@/lib/utils"; // Assuming you have a utility for classNames

interface AddClassDialogProps {
  children?: React.ReactNode;
}

const classSchema = yup.object().shape({
  id: yup
    .string()
    .required("Class ID is required")
    .min(4, "Class ID must be at least 4 characters")
    .max(20, "Class ID must not exceed 20 characters")
    .matches(/^[a-zA-Z0-9]+$/, "Class ID must be alphanumeric"),
  name: yup
    .string()
    .required("Class name is required")
    .min(3, "Class name must be at least 3 characters")
    .max(100, "Class name must not exceed 100 characters"),
  description: yup.string().optional(),
  cover_pic: yup
    .mixed()
    .optional()
    .test(
      "fileType",
      "Invalid image format. Supported formats: jpg, jpeg, png, gif",
      (value) => {
        if (!value) return true;
        if (value instanceof File) {
          const validTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/jpg",
          ];
          return validTypes.includes(value.type);
        }
        return false;
      }
    ),
});

type ClassFormData = yup.InferType<typeof classSchema>;

const AddClassDialog: React.FC<AddClassDialogProps> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverPicPreview, setCoverPicPreview] = useState<string | null>(null);
  const joinCourseMutation = useJoinCourse();
  const [classId, setClassId] = useState("");

  const createClassMutation = useCreateCourse();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<ClassFormData>({
    resolver: yupResolver(classSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      cover_pic: undefined,
    },
  });

  const coverPic = watch("cover_pic");

  const handleCoverPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];

      if (validTypes.includes(file.type)) {
        setValue("cover_pic", file);
        setCoverPicPreview(URL.createObjectURL(file));
      } else {
        // Set error manually
        setError("cover_pic", {
          type: "manual",
          message:
            "Invalid image format. Supported formats: jpg, jpeg, png, gif",
        });
        // Clear any existing preview
        setCoverPicPreview(null);
        // Clear the file input
        e.target.value = "";
      }
    }
  };

  const handleRemoveCoverPic = () => {
    setValue("cover_pic", undefined);
    setCoverPicPreview(null);
  };

  const onSubmit = (data: ClassFormData) => {
    console.log("Creating class:", data);

    createClassMutation.mutate(
      {
        cover_pic: data.cover_pic as File,
        id: data.id,
        description: data.description || "",
        name: data.name,
      },
      {
        onSuccess: () => {
          reset();
          setCoverPicPreview(null);
          setIsDialogOpen(false);
        },
      }
    );
  };

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    joinCourseMutation.mutate(classId, {
      onSuccess: () => {
        setClassId("");
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {children ? (
        <DialogTrigger asChild>{children}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
            title="Add New Class"
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
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Create Class
            </TabsTrigger>
            <TabsTrigger
              value="join"
              className="text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Join Class
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="id"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class ID <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  id="id"
                  {...register("id")}
                  placeholder="Enter a unique id for your class"
                  className={cn(
                    "mt-2 text-sm sm:text-base py-2 sm:py-3",
                    errors.id && "border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.id && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {errors.id.message}
                  </p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Give your class a unique id (e.g., "react-101", "node-404").
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class Name <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter the name of your class"
                  className={cn(
                    "mt-2 text-sm sm:text-base py-2 sm:py-3",
                    errors.name && "border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Give your class a descriptive name (e.g., "Introduction to
                  React").
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe what this class is about"
                  rows={4}
                  className={cn(
                    "mt-2 text-sm sm:text-base py-2 sm:py-3",
                    errors.description && "border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.description && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Provide a brief overview of the class content (optional).
                </p>
              </div>

              <div>
                <label
                  htmlFor="cover_pic"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Cover Image
                </label>
                <div className="mt-2 flex items-center">
                  <Input
                    id="cover_pic"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPicChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cover_pic"
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
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                {errors.cover_pic && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500">
                    {errors.cover_pic.message}
                  </p>
                )}
                {coverPicPreview && (
                  <div className="mt-3">
                    <img
                      src={coverPicPreview}
                      alt="Cover Image Preview"
                      className="h-32 w-full object-contain object-center rounded-md"
                    />
                  </div>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
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

          <TabsContent value="join" className="mt-6">
            <form onSubmit={handleJoinClass} className="space-y-6">
              <div>
                <label
                  htmlFor="classId"
                  className="text-sm sm:text-base font-medium text-gray-700"
                >
                  Class ID <span className="text-red-500 ml-1">*</span>
                </label>
                <Input
                  id="classId"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="Enter the class ID to join"
                  required
                  className="mt-2 text-sm sm:text-base py-2 sm:py-3"
                />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
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
