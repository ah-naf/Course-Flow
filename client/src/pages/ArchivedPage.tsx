import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Archive, MoreVertical, Trash, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import {
  useDeleteCourse,
  useFetchCourse,
  useRestoreCourse,
} from "@/hooks/useCourse";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { ContextMenuTrigger } from "@radix-ui/react-context-menu";

const ArchivedPage: React.FC = () => {
  const { data: archivedCourses, isLoading, error } = useFetchCourse(true);
  const restoreMutation = useRestoreCourse();
  const deleteCourseMutation = useDeleteCourse();

  // State for managing the confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Handle error with sonner toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load archived courses", {
        description: error.message || "An unexpected error occurred",
        duration: 5000,
      });
    }
  }, [error]);

  const handleRestore = (courseId: string) => {
    restoreMutation.mutate(courseId);
  };

  const handleDelete = (courseId: string) => {
    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false); // Close the modal on success
      },
    });
  };

  const openDeleteModal = (courseId: string) => {
    setCourseToDelete(courseId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCourseToDelete(null);
    setIsDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading archived courses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Archive className="h-8 w-8 mr-2 text-blue-600" />
        Archived Courses
      </h1>

      {/* Empty State */}
      {!archivedCourses || (archivedCourses && archivedCourses.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Archive className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Archived Courses
          </h3>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            You haven't archived any courses yet. Courses you archive will
            appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {archivedCourses?.map((course) => (
            <ContextMenu key={course.id}>
              <ContextMenuTrigger>
                <Card
                  className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
                  title={course.name}
                >
                  <div
                    className="h-24 sm:h-28 lg:h-32 flex items-center justify-center relative"
                    style={{
                      ...(course.cover_pic
                        ? {
                            backgroundImage: `url(http://localhost:8080/${course.cover_pic})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : { backgroundColor: course.background_color }),
                    }}
                  >
                    {course.cover_pic && (
                      <div className="absolute inset-0 bg-black opacity-30" />
                    )}
                    <h3 className="text-2xl sm:text-xl z-100 md:text-2xl font-bold text-white px-3 text-center line-clamp-2">
                      {course.name}
                    </h3>
                  </div>
                  <CardContent className="pb-3">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 ring-2 ring-gray-200">
                        <AvatarImage src={course.admin.avatar} />
                        <AvatarFallback
                          style={{ backgroundColor: course.background_color }}
                          className="text-white text-xs sm:text-sm"
                        >
                          {course.admin.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-md truncate">
                          {course.admin.firstName} {course.admin.lastName}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-semibold">
                      Archived on: {formatRelativeTime(course.updated_at || "")}
                    </p>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent className="z-50 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <ContextMenuItem
                  onClick={() => handleRestore(course.id)}
                  className="flex items-center text-green-600 hover:text-green-700 cursor-pointer"
                  disabled={restoreMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>
                    {restoreMutation.isPending ? "Restoring..." : "Restore"}
                  </span>
                </ContextMenuItem>
                <Dialog
                  open={isDeleteModalOpen}
                  onOpenChange={setIsDeleteModalOpen}
                >
                  <DialogTrigger asChild>
                    <ContextMenuItem
                      onClick={() => openDeleteModal(course.id)}
                      className="flex items-center text-red-600 hover:text-red-700 cursor-pointer"
                      onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Course</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete "{course.name}"? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={closeDeleteModal}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          courseToDelete && handleDelete(courseToDelete)
                        }
                        disabled={deleteCourseMutation.isPending}
                      >
                        {deleteCourseMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedPage;
