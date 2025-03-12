// src/pages/ClassroomPage.tsx
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MoreVertical,
  Edit,
  LogOut,
  Link,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notificationStore";
import { useNavigate } from "react-router-dom";
import { fetchCourse } from "@/hooks/useCourse";
import { toast } from "sonner"; // shadcn/ui sonner
import { Loader2 } from "lucide-react"; // For loading spinner

const ClassroomPage: React.FC = () => {
  const { getUnreadCountForClass } = useNotificationStore();
  const navigate = useNavigate();

  const { data: courses, isLoading, error } = fetchCourse();

  // Handle error with shadcn/ui sonner toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load courses", {
        description: error.message || "An unexpected error occurred",
        duration: 5000,
      });
      // Optionally navigate to login if it's an auth error
      if (error.message.includes("401")) {
        navigate("/login");
      }
    }
  }, [error, navigate]);

  // Handler functions for dropdown menu actions
  const handleEditCourse = (courseId: string) => {
    console.log(`Edit course: ${courseId}`);
  };

  const handleLeaveCourse = (courseId: string) => {
    console.log(`Leave course: ${courseId}`);
  };

  const handleCopyLink = (courseId: string) => {
    const link = `https://yourapp.com/classroom/${courseId}`;
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

  const handleArchiveCourse = (courseId: string) => {
    console.log(`Archive course: ${courseId}`);
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
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
                title={course.name}
                onClick={() => navigate(`/class/${course.id}`)}
              >
                <div
                  className="h-24 sm:h-28 lg:h-32 flex items-center justify-center relative"
                  style={{ backgroundColor: course.background_color }} // Updated to match Course type
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white px-3 text-center line-clamp-2">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white absolute top-2 right-2 opacity-70 hover:opacity-100 rounded-full hover:bg-white/20"
                        title="More Options"
                        aria-label="More options for this class"
                      >
                        <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleEditCourse(course.id)}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleLeaveCourse(course.id)}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Leave</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleCopyLink(course.id)}
                        className="cursor-pointer"
                      >
                        <Link className="mr-2 h-4 w-4" />
                        <span>Copy class link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleArchiveCourse(course.id)}
                        className="cursor-pointer"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Archive</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="pb-4">
                  <div className="flex items-center mb-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3 ring-2 ring-gray-200">
                      <AvatarImage src={course.admin.avatar} />{" "}
                      {/* Updated to match Course type */}
                      <AvatarFallback
                        style={{ backgroundColor: course.background_color }} // Updated
                        className="text-white text-sm"
                      >
                        {course.admin.firstName.charAt(0)} {/* Updated */}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">
                        {course.admin.firstName} {course.admin.lastName}{" "}
                        {/* Updated */}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </CardContent>
              </Card>
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
    </div>
  );
};

export default ClassroomPage;
