// src/pages/ClassroomPage.tsx
import React from "react";
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

// Define the type for a course
interface Course {
  id: string;
  name: string;
  description: string;
  instructor: { name: string; avatar: string; initial: string };
  backgroundColor: string;
}

const ClassroomPage: React.FC = () => {
  const { getUnreadCountForClass } = useNotificationStore();
  const navigate = useNavigate();

  // Dummy data with descriptions
  const allCourses: Course[] = [
    {
      id: "react-101",
      name: "React Development",
      description:
        "Learn the fundamentals of React, including components, state management, and hooks.",
      instructor: { name: "Sarah Johnson", avatar: "", initial: "S" },
      backgroundColor: "#4CAF50",
    },
    {
      id: "ui-303",
      name: "UI/UX Design",
      description:
        "Master the art of designing intuitive and visually appealing user interfaces.",
      instructor: { name: "Priya Patel", avatar: "", initial: "P" },
      backgroundColor: "#9C27B0",
    },
    {
      id: "ts-202",
      name: "TypeScript Mastery",
      description:
        "Deep dive into TypeScript, focusing on advanced types, interfaces, and best practices.",
      instructor: { name: "Michael Chen", avatar: "", initial: "M" },
      backgroundColor: "#2196F3",
    },
    {
      id: "node-404",
      name: "Node.js Backend",
      description:
        "Build scalable backend applications using Node.js, Express, and MongoDB.",
      instructor: { name: "Carlos Rodriguez", avatar: "", initial: "C" },
      backgroundColor: "#FF9800",
    },
  ];

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
        console.log("Link copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const handleArchiveCourse = (courseId: string) => {
    console.log(`Archive course: ${courseId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BookOpen className="h-8 w-8 mr-2 text-blue-600" />
        Classroom Dashboard
      </h1>

      {/* Responsive grid with better spacing on small screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {allCourses.map((course) => {
          const unreadCount = getUnreadCountForClass(course.id);
          return (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
              title={course.name}
              onClick={() => navigate(`/class/${course.id}`)}
            >
              <div
                className="h-24 sm:h-28 flex items-center justify-center relative"
                style={{ backgroundColor: course.backgroundColor }}
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
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback
                      style={{ backgroundColor: course.backgroundColor }}
                      className="text-white text-sm"
                    >
                      {course.instructor.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {course.instructor.name}
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

      {allCourses.length === 0 && (
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
