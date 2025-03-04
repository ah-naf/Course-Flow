// src/pages/ArchivedPage.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, MoreVertical, Trash, RefreshCw } from "lucide-react";
import { Course } from "@/utils/types";

const ArchivedPage: React.FC = () => {
  // Dummy data for archived courses
  const [archivedCourses, setArchivedCourses] = useState<Course[]>([
    {
      id: "web-101",
      name: "Web Fundamentals",
      description:
        "Learn the basics of web development with HTML, CSS, and JavaScript.",
      instructor: { id: "1", name: "Emma Watson", avatar: "", initial: "E" },
      backgroundColor: "#FF5722",
      // category: "Web",
      timestamp: "2024-10-15",
    },
    {
      id: "graphql-202",
      name: "GraphQL Basics",
      description: "Introduction to GraphQL for building efficient APIs.",
      instructor: { id: "2", name: "Liam Brown", avatar: "", initial: "L" },
      backgroundColor: "#E91E63",
      // category: "Backend",
      timestamp: "2024-09-20",
    },
    {
      id: "figma-303",
      name: "Figma for Beginners",
      description: "Get started with Figma to design stunning user interfaces.",
      instructor: { id: "3", name: "Olivia Smith", avatar: "", initial: "O" },
      backgroundColor: "#673AB7",
      // category: "Design",
      timestamp: "2024-08-10",
    },
  ]);

  // Handle Restore action
  const handleRestore = (courseId: string) => {
    setArchivedCourses((prev) =>
      prev.filter((course) => course.id !== courseId)
    );
    console.log(`Restored course with ID: ${courseId}`);
  };

  // Handle Delete action
  const handleDelete = (courseId: string) => {
    setArchivedCourses((prev) =>
      prev.filter((course) => course.id !== courseId)
    );
    console.log(`Deleted course with ID: ${courseId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Archive className="h-8 w-8 mr-2 text-blue-600" />
        Archived Courses
      </h1>

      {/* Empty State */}
      {archivedCourses.length === 0 ? (
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
          {archivedCourses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
              title={course.name}
            >
              <div
                className="h-24 sm:h-28 flex items-center justify-center relative"
                style={{ backgroundColor: course.backgroundColor }}
              >
                <h3 className="text-2xl sm:text-xl md:text-2xl font-bold text-white px-3 text-center line-clamp-2">
                  {course.name}
                </h3>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white absolute top-2 right-2 opacity-70 hover:opacity-100 rounded-full hover:bg-white/20"
                      title="More Options"
                    >
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleRestore(course.id)}
                      className="flex items-center text-green-600 hover:text-green-700 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(course.id)}
                      className="flex items-center text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center mb-2">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 ring-2 ring-gray-200">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback
                      style={{ backgroundColor: course.backgroundColor }}
                      className="text-white text-xs sm:text-sm"
                    >
                      {course.instructor.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-md truncate">
                      {course.instructor.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-semibold">
                  Archived on: {course.timestamp}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedPage;
