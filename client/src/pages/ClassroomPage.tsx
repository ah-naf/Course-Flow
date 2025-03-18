// src/pages/ClassroomPage.tsx
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Link, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notificationStore";
import { useNavigate } from "react-router-dom";
import {
  useArchiveCourse,
  useFetchCourse,
  useLeaveCourse,
} from "@/hooks/useCourse";
import { toast } from "sonner"; // shadcn/ui sonner
import { Loader2 } from "lucide-react"; // For loading spinner
import { useUserStore } from "@/store/userStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ContextMenuContent } from "@radix-ui/react-context-menu";

const ClassroomPage: React.FC = () => {
  const { getUnreadCountForClass } = useNotificationStore();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const { data: courses, isLoading, error } = useFetchCourse();
  const archiveCourseMutation = useArchiveCourse();

  const [leaveCourseDialogOpen, setLeaveCourseDialogOpen] =
    React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handle error with shadcn/ui sonner toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load courses", {
        description: error.message || "An unexpected error occurred",
        duration: 5000,
      });
    }
  }, [error]);

  const handleLeaveCourse = (
    courseId: string,
    courseName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedCourse({ id: courseId, name: courseName });
    setLeaveCourseDialogOpen(true);
  };

  const handleCopyLink = (joinCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `https://localhost:5173/join/${joinCode}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy link", {
          description: err.message,
        });
      });
  };

  const handleArchiveCourse = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    archiveCourseMutation.mutate(courseId);
  };

  // Loading container
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BookOpen className="h-8 w-8 mr-2 text-blue-600" />
        Classroom Dashboard
      </h1>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {courses.map((course) => {
            const unreadCount = getUnreadCountForClass(course.id);
            return (
              <ContextMenu key={course.id}>
                <ContextMenuTrigger>
                  <Card
                    className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
                    title={course.name}
                    onClick={() => navigate(`/class/${course.join_code}`)}
                  >
                    <div
                      className="h-24 sm:h-28 lg:h-32 flex items-center justify-center relative"
                      style={{
                        ...(course.cover_pic
                          ? {
                              backgroundImage: `url(${course.cover_pic})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : { backgroundColor: course.background_color }),
                      }}
                    >
                      {course.cover_pic && (
                        <div className="absolute inset-0 bg-black opacity-30" />
                      )}
                      <h3 className="text-xl sm:text-2xl z-100 font-bold text-white px-3 text-center line-clamp-2">
                        {course.name}
                      </h3>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2 h-6 w-6 flex items-center justify-center rounded-full text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="pb-4">
                      <div className="flex items-center mb-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3 ring-2 ring-gray-200">
                          <AvatarImage src={course.admin.avatar} />
                          <AvatarFallback
                            style={{ backgroundColor: course.background_color }}
                            className="text-white text-sm"
                          >
                            {course.admin.firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">
                            {course.admin.firstName} {course.admin.lastName}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                    </CardContent>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-50 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {user?.id !== course.admin.id && (
                    <ContextMenuItem
                      onClick={(e) =>
                        handleLeaveCourse(course.id, course.name, e)
                      }
                      className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Leave</span>
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem
                    onClick={(e) => handleCopyLink(course.join_code, e)}
                    className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    <span>Copy class link</span>
                  </ContextMenuItem>
                  {user?.id === course.admin.id && (
                    <ContextMenuItem
                      onClick={(e) => handleArchiveCourse(course.id, e)}
                      className="cursor-pointer px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Archive className="mr-2 h-4 w-4 text-red-500" />
                      <span className="hover:text-red-500">Archive</span>
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No courses yet
          </h3>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            You haven't enrolled in any courses or started teaching yet.
          </p>
          <Button>Join Courses</Button>
        </div>
      )}
      {selectedCourse && (
        <LeaveCourseDialog
          isOpen={leaveCourseDialogOpen}
          onClose={() => setLeaveCourseDialogOpen(false)}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
        />
      )}
    </div>
  );
};

export default ClassroomPage;

interface LeaveCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

const LeaveCourseDialog: React.FC<LeaveCourseDialogProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
}) => {
  const [isLeaving, setIsLeaving] = React.useState(false);
  const leaveCourseMutation = useLeaveCourse();

  const handleLeave = async () => {
    setIsLeaving(true);
    leaveCourseMutation.mutate(
      { courseId, courseName },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogOut className="mr-2 h-5 w-5 text-red-500" />
            Leave Course
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to leave "{courseName}"? You will no longer
            have access to the course content and discussions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLeaving}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isLeaving}
            className="ml-2"
          >
            {isLeaving ? (
              <>
                <span className="mr-2">Leaving...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              </>
            ) : (
              "Leave Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
