// src/pages/ClassPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassBanner } from "@/components/ClassBanner";
import { CreatePostButton } from "@/components/CreatePostButton";
import { PostList } from "@/components/PostList";
import {
  Course,
  Post,
  ChatMessage,
  GroupMember,
  FileStorage,
} from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import GroupMembers from "@/components/GroupMembers";
import Attachments from "@/components/Attachments";

// Classroom Chat Component
const ClassroomChat: React.FC<{ course: Course }> = ({ course }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: {
        id: course.instructor.id,
        username: course.instructor.username,
        initial: course.instructor.initial,
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
      },
      text: "Welcome to the classroom chat! Feel free to ask questions here.",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      sender: {
        id: "student1",
        username: "AlexJohnson",
        initial: "A",
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
      },
      text: "Hi everyone! Can someone help me understand the last lecture?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full min-h-[300px]">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Classroom Chat
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {msg.sender.initial}
            </div>
            <div>
              <p className="font-medium text-sm sm:text-base">
                {msg.sender.username}
              </p>
              <p className="text-gray-700 text-sm sm:text-base">{msg.text}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main ClassPage Component
const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // State for dialogs
  const [isJoinDetailsDialogOpen, setIsJoinDetailsDialogOpen] = useState(false);

  // Dummy data for the course (same as before)
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
      backgroundColor: "#4CAF50",
      coverPic: "https://via.placeholder.com/1200x400?text=React+Development",
      joinCode: "RCT-DEV-2025",
      inviteLink: "https://yourapp.com/join/react-101",
      isPrivate: false,
    },
    {
      id: "ui-303",
      name: "UI/UX Design",
      description:
        "Master the art of designing intuitive and visually appealing user interfaces. Master the art of designing intuitive and visually appealing user interfaces. Master the art of designing intuitive and visually appealing user interfaces. Master the art of designing intuitive and visually appealing user interfaces.",
      instructor: {
        id: "2",
        firstName: "ss",
        lastName: "ss",
        avatar: "",
        email: "",
        username: "Priya Patel",
        initial: "P",
      },
      backgroundColor: "#9C27B0",
      coverPic: "",
      joinCode: "UIX-303-2025",
      inviteLink: "https://yourapp.com/join/ui-303",
      isPrivate: false,
    },
  ];

  const course = allCourses.find((c) => c.id === classId);

  if (!course) {
    navigate("/");
    return null;
  }

  // Flag to control visibility of join details
  const showJoinDetails = !course.isPrivate;

  return (
    <div className="p-1 md:p-6 flex justify-center">
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
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-24 sm:h-12 mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
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
              value="chat"
              className="px-4 py-2.5 text-sm text-gray-700 
        data-[state=active]:bg-white 
        data-[state=active]:text-blue-600 
        data-[state=active]:font-semibold 
        transition-colors duration-200"
            >
              Chat{" "}
              <Badge variant="destructive" className="px-1.5 py-0.5">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="px-4 py-2.5 text-sm text-gray-700 
        data-[state=active]:bg-white 
        data-[state=active]:text-blue-600 
        data-[state=active]:font-semibold 
        transition-colors duration-200"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="px-4 py-2.5 text-sm text-gray-700 
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
          <TabsContent value="chat">
            <ClassroomChat course={course} />
          </TabsContent>
          <TabsContent value="members">
            <GroupMembers course={course} />
          </TabsContent>
          <TabsContent value="files">
            <Attachments course={course} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassPage;
