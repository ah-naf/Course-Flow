import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Calendar,
  Clock,
  Shield,
  Users,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Course, User } from "@/utils/types";

const CourseJoin = () => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  // Mock data with additional member count
  const dummyInstructor: User = {
    id: "user-123",
    firstName: "Alex",
    lastName: "Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    avatar: "/api/placeholder/32/32",
    initial: "AJ",
  };

  const dummyCourse: Course & { memberCount: number } = {
    id: "course-456",
    name: "Advanced Machine Learning",
    description:
      "Explore cutting-edge machine learning techniques, deep neural networks, and practical applications in various industries.",
    instructor: dummyInstructor,
    background_color: "#4f46e5",
    cover_pic: undefined, // Set to a URL string to test with cover image
    join_code: "ML2025",
    updated_at: "2025-03-10T14:30:00Z",
    post_permission: "instructor_only",
    role: "student",
    memberCount: 42,
  };

  const handleJoinCourse = async () => {
    setIsJoining(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Successfully joined the course!", {
        description: "Redirecting to classroom...",
      });

      setTimeout(() => {
        navigate("/classroom");
      }, 2000);
    }, 1500);
  };

  const hasCoverImage = !!dummyCourse.cover_pic;

  return (
    <div className="flex justify-center items-center h-full bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden pt-0">
        {/* Header section with conditional rendering based on cover image */}
        <div
          className={`${
            hasCoverImage ? "h-40" : "h-40 relative flex items-end"
          }`}
          style={{
            backgroundColor: dummyCourse.background_color,
            backgroundImage: dummyCourse.cover_pic
              ? `url(${dummyCourse.cover_pic})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!hasCoverImage && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative z-10 p-6">
                <Badge className="mb-2" variant="secondary">
                  {dummyCourse.join_code}
                </Badge>
                <h2 className="text-white text-2xl font-bold">
                  {dummyCourse.name}
                </h2>
              </div>
            </>
          )}
        </div>

        <CardHeader className="pt-4 pb-2">
          {hasCoverImage && (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{dummyCourse.join_code}</Badge>
              </div>
              <CardTitle className="text-xl">{dummyCourse.name}</CardTitle>
            </>
          )}
          <CardDescription className="text-base text-gray-700">
            {dummyCourse.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                {dummyCourse.instructor.initial}
              </div>
              <div>
                <div className="font-medium">{`${dummyCourse.instructor.firstName} ${dummyCourse.instructor.lastName}`}</div>
                <div className="text-sm text-gray-500">Admin</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">CREATED</span>
                </div>
                <span className="text-sm font-medium">
                  {format(new Date("2025-01-15"), "MMMM d, yyyy")}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">UPDATED</span>
                </div>
                <span className="text-sm font-medium">
                  {dummyCourse.updated_at
                    ? format(new Date(dummyCourse.updated_at), "MMMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">POSTS</span>
                </div>
                <span className="text-sm font-medium">
                  {dummyCourse.post_permission === "instructor_only"
                    ? "Admin only"
                    : dummyCourse.post_permission}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">MEMBERS</span>
                </div>
                <span className="text-sm font-medium">
                  {dummyCourse.memberCount} students
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              className="w-1/3"
              onClick={() => navigate("/classroom")}
            >
              Cancel
            </Button>
            <Button
              className="w-2/3 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleJoinCourse}
              disabled={isJoining}
            >
              {isJoining ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Joining...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Join Course</span>
                </div>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseJoin;
