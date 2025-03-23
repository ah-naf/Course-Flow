// src/pages/ClassPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassBanner } from "@/components/ClassBanner";
import { CreatePostButton } from "@/components/CreatePostButton";
import { PostList } from "@/components/PostList";
import { Course } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import GroupMembers from "@/components/GroupMembers";
import Attachments from "@/components/Attachments";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClassroomChat from "@/components/ClassroomChat";
import { useCoursePreview } from "@/hooks/useCourse";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";

// Main ClassPage Component
const ClassPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [searchParams, setSearchParams] = useSearchParams(); // Updated to allow setting params

  const { data: course, isLoading, error } = useCoursePreview(classId);
  const [isJoinDetailsDialogOpen, setIsJoinDetailsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get the tab from URL query, default to "posts" if invalid or not found
  const validTabs = ["posts", "members", "files"];
  const tabFromUrl = searchParams.get("tab");
  const initialTab = validTabs.includes(tabFromUrl || "")
    ? tabFromUrl || "posts"
    : "posts";

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state with URL when it changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab }); // Update URL query parameter
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-700 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg overflow-hidden pt-0">
          <div className="h-24 bg-gradient-to-r from-red-100 to-red-300"></div>
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-red-50 rounded-full mb-2">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-xl">Unable to Load Course</CardTitle>
            <CardDescription className="text-base mt-2">
              {typeof error === "string"
                ? error
                : error?.message ||
                  "We couldn't load the course information. Please try again later."}
            </CardDescription>
          </CardHeader>

          <CardFooter className="pt-4 pb-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 px-4"
              onClick={() => navigate("/")}
            >
              Return to Classroom
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!course || !user) {
    navigate("/");
    return null; // Return null since navigate will handle redirection
  }

  // Flag to control visibility of join details
  const showJoinDetails = !course.is_private || course.admin.id === user.id;

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
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange} // Handle tab changes
          className="mt-4"
        >
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
            {course.role >= course.post_permission && (
              <CreatePostButton
                instructor={course.admin}
                courseID={course.id}
              />
            )}

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
