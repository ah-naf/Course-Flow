// src/pages/ClassPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassBanner } from "@/components/ClassBanner";
import { CreatePostButton } from "@/components/CreatePostButton";
import { PostList } from "@/components/PostList";
import { Course } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import GroupMembers from "@/components/GroupMembers";
import Attachments from "@/components/Attachments";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react"; // Added Send icon
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClassroomChat from "@/components/ClassroomChat";
import { fetchCourse } from "@/hooks/useCourse";

// Main ClassPage Component
const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  

  // State for dialogs
  const [isJoinDetailsDialogOpen, setIsJoinDetailsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Dummy data for the course
  const allCourses: Course[] = [
    {
      id: "react-101",
      name: "React Development",
      description:
        "Learn the fundamentals of React, including components, state management, and hooks.",
      instructor: {
        id: "1",
        firstName: "ss",
        lastName: "ss",
        avatar: "",
        email: "",
        username: "Sarah Johnson",
        initial: "S",
      },
      background_color: "#4CAF50",
      cover_pic: "https://via.placeholder.com/1200x400?text=React+Development",
      joinCode: "RCT-DEV-2025",
      post_permission: "everyone",
      role: "",
    },
    {
      id: "ui-303",
      name: "UI/UX Design",
      description:
        "Master the art of designing intuitive and visually appealing user interfaces.",
      instructor: {
        id: "2",
        firstName: "ss",
        lastName: "ss",
        avatar: "",
        email: "",
        username: "Priya Patel",
        initial: "P",
      },
      background_color: "#9C27B0",
      cover_pic: "",
      joinCode: "UIX-303-2025",
      post_permission: "instructor",
      role: "",
    },
  ];

  const course = allCourses.find((c) => c.id === classId);

  if (!course) {
    navigate("/");
    return null;
  }

  // Flag to control visibility of join details
  const showJoinDetails = true;

  return (
    <div className="p-1 md:p-6 flex justify-center relative">
      <div className="w-full max-w-5xl">
        {/* Banner */}
        <ClassBanner
          course={course}
          showJoinDetails={showJoinDetails}
          setIsJoinDetailsDialogOpen={setIsJoinDetailsDialogOpen}
          isJoinDetailsDialogOpen={isJoinDetailsDialogOpen}
        />

        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full h-12 mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <TabsTrigger
              value="posts"
              className="px-4 py-2 text-sm text-gray-700 
                data-[state=active]:bg-white 
                data-[state=active]:text-blue-600 
                data-[state=active]:font-semibold 
                transition-colors duration-200"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="px-4 py-2 text-sm text-gray-700 
                data-[state=active]:bg-white 
                data-[state=active]:text-blue-600 
                data-[state=active]:font-semibold 
                transition-colors duration-200"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="px-4 py-2 text-sm text-gray-700 
                data-[state=active]:bg-white 
                data-[state=active]:text-blue-600 
                data-[state=active]:font-semibold 
                transition-colors duration-200"
            >
              Attachments
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            {/* Post Creation Button */}
            <CreatePostButton instructor={course.instructor} />

            {/* Posts Section */}
            <PostList course={course} classId={classId || ""} />
          </TabsContent>
          <TabsContent value="members">
            <GroupMembers course={course} />
          </TabsContent>
          <TabsContent value="files">
            <Attachments course={course} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="relative bg-blue-600 hover:bg-blue-700 rounded-full p-3 cursor-pointer shadow-lg"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="w-10 h-10 text-white" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
          >
            3
          </Badge>
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="min-w-[95vw] lg:min-w-5xl xl:min-w-6xl min-h-[97vh] lg:min-h-[70vh] p-0 bg-white rounded-xl shadow-2xl border border-gray-200">
          <ClassroomChat course={course} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassPage;
