import React from "react";
import AppLayout from "@/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

const ClassroomPage: React.FC = () => {
  // Dummy data
  const allCourses = [
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
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden hover:shadow-lg pt-0 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 border border-gray-200 rounded-xl"
            title={course.name}
          >
            <div
              className="h-28 flex items-center justify-center relative"
              style={{ backgroundColor: course.backgroundColor }}
            >
              <h3 className="text-2xl font-bold text-white">{course.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-white absolute top-2 right-2 opacity-70 hover:opacity-100 rounded-full hover:bg-white/20"
                title="More Options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3 ring-2 ring-gray-200">
                  <AvatarImage src="/api/placeholder/40/40" />
                  <AvatarFallback
                    style={{ backgroundColor: course.backgroundColor }}
                    className="text-white"
                  >
                    {course.instructor.initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {course.instructor.name}
                  </p>
                  <p className="text-xs text-gray-500">{course.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default ClassroomPage;
