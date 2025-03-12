// src/pages/Sidebar.tsx
import React, { useState } from "react";
import { ChevronRight, Home, BookOpen, Archive } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { fetchCourse } from "@/hooks/useCourse"; // For enrolled courses
import { fetchTeachingCourses } from "@/hooks/useCourse"; // New hook for teaching courses
import { Loader2 } from "lucide-react"; // For loading spinner

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [teachingOpen, setTeachingOpen] = useState(true);
  const [enrolledOpen, setEnrolledOpen] = useState(true);
  const navigate = useNavigate();

  // Fetch teaching courses
  const {
    data: teachingCourses,
    isLoading: isTeachingLoading,
    error: teachingError,
  } = fetchTeachingCourses();

  // Fetch enrolled courses (non-archived)
  const {
    data: enrolledCourses,
    isLoading: isEnrolledLoading,
    error: enrolledError,
  } = fetchCourse(false);

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div
        className="p-4 flex items-center font-medium text-xl"
        title="Learning Hub"
      >
        <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
        <span>Learning Hub</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start cursor-pointer"
          title="Home"
          onClick={() => navigate("/")}
        >
          <Home className="h-4 w-4 mr-2" /> Home
        </Button>

        {/* Teaching Section */}
        <Collapsible
          open={teachingOpen}
          onOpenChange={setTeachingOpen}
          className="px-2 py-1"
        >
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              title="Teaching"
            >
              <span className="font-medium">Teaching</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  teachingOpen && "rotate-90"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            {isTeachingLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : teachingError ? (
              <p className="text-sm text-red-600 text-center">Failed to load</p>
            ) : teachingCourses && teachingCourses.length > 0 ? (
              teachingCourses.map((course) => (
                <Button
                  key={course.id}
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2"
                  title={course.name}
                  onClick={() => navigate(`/class/${course.id}`)} // Navigate to course page
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.admin.avatar} />
                    <AvatarFallback
                      style={{ backgroundColor: course.background_color }}
                      className="text-white text-xs"
                    >
                      {course.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{course.name}</span>
                </Button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No teaching courses
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Enrolled Section */}
        <Collapsible
          open={enrolledOpen}
          onOpenChange={setEnrolledOpen}
          className="px-2 py-1"
        >
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              title="Enrolled"
            >
              <span className="font-medium">Enrolled</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  enrolledOpen && "rotate-90"
                )}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            {isEnrolledLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : enrolledError ? (
              <p className="text-sm text-red-600 text-center">Failed to load</p>
            ) : enrolledCourses && enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <Button
                  key={course.id}
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2"
                  title={course.name}
                  onClick={() => navigate(`/class/${course.id}`)} // Navigate to course page
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.admin.avatar} />
                    <AvatarFallback
                      style={{ backgroundColor: course.background_color }}
                      className="text-white text-xs"
                    >
                      {course.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{course.name}</span>
                </Button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No enrolled courses
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Button
          variant="ghost"
          className="w-full justify-start px-4 cursor-pointer"
          title="Archived"
          onClick={() => navigate("/archived")}
        >
          <Archive className="h-4 w-4 mr-2" /> Archived
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
