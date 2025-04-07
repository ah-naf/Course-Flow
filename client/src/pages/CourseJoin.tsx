import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useJoinCourse, useCoursePreview } from "@/hooks/useCourse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CourseJoin = () => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const location = useLocation();
  const course_joincode = location.pathname.split("/")[2];
  const joinCourseMutation = useJoinCourse();

  const { data: course, isLoading, error } = useCoursePreview(course_joincode);

  const handleJoinCourse = async () => {
    setIsJoining(true);
    joinCourseMutation.mutate(course_joincode, {
      onSuccess: () => {
        navigate("/");
      },
    });
    setIsJoining(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg p-6 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading course preview...</p>
        </Card>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg overflow-hidden">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-xl">Course Not Available</CardTitle>
            <CardDescription className="text-base">
              {error?.message ||
                "This course doesn't exist or is not accessible."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-6 flex justify-center">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate("/")}
            >
              Return to Classroom
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hasCoverImage = !!course.cover_pic;
  const adminInitial = course.admin
    ? `${course.admin.firstName?.[0] || ""}${course.admin.lastName?.[0] || ""}`
    : "AD";

  return (
    <div className="flex justify-center items-center h-full bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg overflow-hidden pt-0">
        {/* Header section with conditional rendering based on cover image */}
        <div
          className={`${
            hasCoverImage ? "h-40" : "h-40 relative flex items-end"
          }`}
          style={{
            backgroundColor: course.background_color,
            backgroundImage: course.cover_pic
              ? `url(${course.cover_pic})`
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
                  {course.join_code}
                </Badge>
                <h2 className="text-white text-2xl font-bold">{course.name}</h2>
              </div>
            </>
          )}
        </div>

        <CardHeader className="pt-4 pb-2">
          {hasCoverImage && (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{course.join_code}</Badge>
              </div>
              <CardTitle className="text-xl">{course.name}</CardTitle>
            </>
          )}
          <CardDescription className="text-base text-gray-700">
            {course.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {course.admin && (
              <div className="flex items-start space-x-3 mb-4 p-3 bg-slate-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={course.admin.avatar}
                    alt={`${course.admin.firstName} ${course.admin.lastName}`}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-800">
                    {adminInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{`${
                    course.admin.firstName || ""
                  } ${course.admin.lastName || ""}`}</div>
                  <div className="text-sm text-gray-500">Admin</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">CREATED</span>
                </div>
                <span className="text-sm font-medium">
                  {course.created_at
                    ? format(new Date(course.created_at), "MMMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium">UPDATED</span>
                </div>
                <span className="text-sm font-medium">
                  {course.updated_at
                    ? format(new Date(course.updated_at), "MMMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">POSTS</span>
                </div>
                <span className="text-sm font-medium">
                  {course.post_permission === 3
                    ? "Admin only"
                    : course.post_permission === 2
                    ? "Moderators & Admins"
                    : "All members"}
                </span>
              </div>

              <div className="flex flex-col space-y-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">MEMBERS</span>
                </div>
                <span className="text-sm font-medium">
                  {course.total_members}{" "}
                  {course.total_members === 1 ? "student" : "students"}
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
