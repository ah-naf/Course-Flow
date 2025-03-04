// src/pages/ClassPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClassBanner } from "@/components/ClassBanner";
import { CreatePostButton } from "@/components/CreatePostButton";
import { PostList } from "@/components/PostList";
import { Course } from "@/utils/types";

const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  // State for dialogs
  const [isJoinDetailsDialogOpen, setIsJoinDetailsDialogOpen] = useState(false);

  // Dummy data for the course
  const allCourses: Course[] = [
    {
      id: "react-101",
      name: "React Development",
      description:
        "Learn the fundamentals of React, including components, state management, and hooks.",
      instructor: { id: "1", name: "Sarah Johnson", avatar: "", initial: "S" },
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
      instructor: { id: "2", name: "Priya Patel", avatar: "", initial: "P" },
      backgroundColor: "#9C27B0",
      coverPic: "",
      joinCode: "UIX-303-2025",
      inviteLink: "https://yourapp.com/join/ui-303",
      isPrivate: false,
    },
    {
      id: "ts-202",
      name: "TypeScript Mastery",
      description:
        "Deep dive into TypeScript, focusing on advanced types, interfaces, and best practices.",
      instructor: { id: "3", name: "Michael Chen", avatar: "", initial: "M" },
      backgroundColor: "#2196F3",
      coverPic: "https://via.placeholder.com/1200x400?text=TypeScript+Mastery",
      joinCode: "TS-MST-2025",
      inviteLink: "https://yourapp.com/join/ts-202",
      isPrivate: false,
    },
    {
      id: "node-404",
      name: "Node.js Backend",
      description:
        "Build scalable backend applications using Node.js, Express, and MongoDB.",
      instructor: {
        id: "4",
        name: "Carlos Rodriguez",
        avatar: "",
        initial: "C",
      },
      backgroundColor: "#FF9800",
      coverPic: "https://via.placeholder.com/1200x400?text=Node.js+Backend",
      joinCode: "NODE-BE-2025",
      inviteLink: "https://yourapp.com/join/node-404",
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

        {/* Post Creation Button */}
        <CreatePostButton instructor={course.instructor} />

        {/* Posts Section */}
        <PostList course={course} classId={classId || ""} />
      </div>
    </div>
  );
};

export default ClassPage;
