import React, { useState, useEffect } from "react";
import { Course, GroupMember } from "@/utils/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserX, Search, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGroupMembersStore } from "@/store/groupMemberStore";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { useFetchCourseMember } from "@/hooks/useCourseMember";
import { toast } from "sonner";
import { getRoleLabel } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";

const GroupMembers: React.FC<{ course: Course }> = ({ course }) => {
  const { members, setMembers, removeMember, updateMemberRole } =
    useGroupMembersStore();
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use the hook to fetch data
  const { data, isLoading, isError, error } = useFetchCourseMember(course.id);

  // Determine if the current user is an instructor or admin
  const isCurrentUserInstructor = user?.role === 3;
  const isCurrentUserAdmin = user?.id === course.admin.id;
  const canManageRoles = isCurrentUserInstructor || isCurrentUserAdmin;

  // Handle data changes and errors
  useEffect(() => {
    if (data) {
      setMembers(data);
    }
  }, [data, setMembers]);

  useEffect(() => {
    if (isError && error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      toast.error(`Failed to load members: ${errorMsg}`);

      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isError, error]);

  const handleKickMember = (memberId: string) => {
    if (confirm(`Are you sure you want to kick this member?`)) {
      removeMember(memberId);
    }
  };

  const filteredMembers = members.filter(
    (member: GroupMember) =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full min-h-[300px]">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Group Members
      </h2>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search members by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarImage
                    src={member.avatar}
                    alt={`${member.username}'s avatar`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {member.initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-sm sm:text-base text-left"
                      >
                        {member.username}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg w-full max-h-[80vh] p-0">
                      <DialogHeader className="p-6 pb-0">
                        <DialogTitle>Member Profile</DialogTitle>
                      </DialogHeader>
                      <Card className="m-6 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center space-y-4">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={`${member.username}'s avatar`}
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl font-semibold border-2 border-gray-200">
                                {member.initial}
                              </div>
                            )}
                            <div className="text-center">
                              <h3 className="text-xl font-semibold">
                                {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                @{member.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {member.email}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm">
                                <span className="font-medium">Role:</span>{" "}
                                {getRoleLabel(member.role)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Joined:</span>{" "}
                                {formatRelativeTime(member.created_at || "")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogContent>
                  </Dialog>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {getRoleLabel(member.role)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-xs sm:text-sm text-gray-500">
                  Joined: {formatRelativeTime(member.created_at || "")}
                </p>

                {/* Role Dropdown - Only shown for instructors or admins */}
                {canManageRoles && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        {getRoleLabel(member.role)}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* Only admin can promote someone to instructor */}
                      {isCurrentUserAdmin && (
                        <DropdownMenuItem
                          onClick={() => updateMemberRole(member.id, 3)}
                        >
                          Instructor
                        </DropdownMenuItem>
                      )}
                      {/* Both admin and instructor can promote to moderator */}
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, 2)}
                      >
                        Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateMemberRole(member.id, 1)}
                      >
                        Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Kick Button - Only shown for instructors or admins */}
                {canManageRoles && (isCurrentUserAdmin || member.role < 3) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleKickMember(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Kick
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && !isLoading && (
            <p className="text-center text-gray-500">No members found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
