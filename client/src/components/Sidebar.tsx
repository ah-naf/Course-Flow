import React, { useState } from "react";
import {
  ChevronRight,
  Home,
  BookOpen,
  Archive,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Course {
  id: string;
  name: string;
  instructor: {
    name: string;
    avatar: string;
    initial: string;
  };
  backgroundColor: string;
  category?: string;
}

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [teachingOpen, setTeachingOpen] = useState(true);
  const [enrolledOpen, setEnrolledOpen] = useState(true);

  // Dummy data for courses the user is teaching
  const teachingCourses: Course[] = [
    {
      id: "react-101",
      name: "React Development",
      instructor: { name: "Sarah Johnson", avatar: "", initial: "S" },
      backgroundColor: "#4CAF50",
      category: "Web",
    },
    {
      id: "ui-303",
      name: "UI/UX Design",
      instructor: { name: "Priya Patel", avatar: "", initial: "P" },
      backgroundColor: "#9C27B0",
      category: "Design",
    },
  ];

  // Dummy data for courses the user is enrolled in
  const enrolledCourses: Course[] = [
    {
      id: "ts-202",
      name: "TypeScript Mastery",
      instructor: { name: "Michael Chen", avatar: "", initial: "M" },
      backgroundColor: "#2196F3",
      category: "Programming",
    },
    {
      id: "node-404",
      name: "Node.js Backend",
      instructor: { name: "Carlos Rodriguez", avatar: "", initial: "C" },
      backgroundColor: "#FF9800",
      category: "Backend",
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-4 flex items-center font-medium text-xl" title="Learning Hub">
        <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
        <span>Learning Hub</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        <Button variant="ghost" className="w-full justify-start" title="Home">
          <Home className="h-4 w-4 mr-2" /> Home
        </Button>

        {/* Teaching Section */}
        <Collapsible open={teachingOpen} onOpenChange={setTeachingOpen} className="px-2 py-1">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer" title="Teaching">
              <span className="font-medium">Teaching</span>
              <ChevronRight className={cn("h-4 w-4 transition-transform", teachingOpen && "rotate-90")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            {teachingCourses.map((course) => (
              <Button key={course.id} variant="ghost" className="w-full justify-start text-sm gap-2" title={course.name}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback 
                    style={{ backgroundColor: course.backgroundColor }} 
                    className="text-white text-xs"
                  >
                    {course.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{course.name}</span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Enrolled Section */}
        <Collapsible open={enrolledOpen} onOpenChange={setEnrolledOpen} className="px-2 py-1">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer" title="Enrolled">
              <span className="font-medium">Enrolled</span>
              <ChevronRight className={cn("h-4 w-4 transition-transform", enrolledOpen && "rotate-90")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            {enrolledCourses.map((course) => (
              <Button key={course.id} variant="ghost" className="w-full justify-start text-sm gap-2" title={course.name}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={course.instructor.avatar} />
                  <AvatarFallback 
                    style={{ backgroundColor: course.backgroundColor }} 
                    className="text-white text-xs"
                  >
                    {course.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{course.name}</span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Button variant="ghost" className="w-full justify-start px-4" title="Archived">
          <Archive className="h-4 w-4 mr-2" /> Archived
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;