import React, { useState, useEffect } from "react";
import { Course, GroupMember } from "@/utils/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useChangeRole, useFetchCourseMember } from "@/hooks/useCourseMember";
import { toast } from "sonner";
import { getRoleLabel } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";
import { useLeaveCourse } from "@/hooks/useCourse";

const GroupMembers: React.FC<{ course: Course }> = ({ course }) => {
  const { members, setMembers, removeMember, updateMemberRole } =
    useGroupMembersStore();
  const { user } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memberToKick, setMemberToKick] = useState<GroupMember | null>(null);

  const kickMemberMutation = useLeaveCourse(true);
  const changeRoleMutation = useChangeRole(course.id);
  const { data, isLoading, isError, error } = useFetchCourseMember(course.id);

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
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, error]);

  const handleKickMember = (member: GroupMember) => {
    setMemberToKick(member); // Set the member to show confirmation dialog
  };

  const confirmKickMember = () => {
    if (memberToKick) {
      kickMemberMutation.mutate(
        {
          courseId: course.id,
          courseName: course.name,
          idToKick: memberToKick.id,
        },
        {
          onSuccess: () => {
            removeMember(memberToKick.id);
            setMemberToKick(null);
          },
        }
      );
    }
  };

  const handleRoleChange = (memberId: string, newRole: number) => {
    changeRoleMutation.mutate(
      {
        member_id: memberId,
        role: newRole,
      },
      {
        onSuccess: () => {
          // Update local state through the store
          updateMemberRole(memberId, newRole);
        },
      }
    );
  };

  // Helper to determine if current user can change a member's role
  const canChangeRole = (memberRole: number): boolean => {
    if (!user) return false;

    // Admin can change anyone's role
    if (user.id === course.admin.id) return true;

    // Find current user's role in this course
    const currentUserMember = members.find((m) => m.id === user.id);
    if (!currentUserMember) return false;

    // Users can only manage members with lower roles than their own
    return currentUserMember.role > memberRole;
  };

  // Helper to determine if current user can kick a member
  const canKickMember = (memberRole: number): boolean => {
    if (!user) return false;

    // Admin can kick anyone
    if (user.id === course.admin.id) return true;

    // Find current user's role in this course
    const currentUserMember = members.find((m) => m.id === user.id);
    if (!currentUserMember) return false;

    // Users can only kick members with lower roles than their own
    return currentUserMember.role > memberRole && currentUserMember.role > 2;
  };

  // Get current user's role in this course
  const getCurrentUserRole = (): number => {
    if (!user) return 0;

    // Admin has highest authority
    if (user.id === course.admin.id) return 999;

    // Find current user's role in this course
    const currentUserMember = members.find((m) => m.id === user.id);
    return currentUserMember?.role || 0;
  };

  const currentUserRole = getCurrentUserRole();

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
          {filteredMembers.map((member) => {
            // Skip rendering yourself if you're the admin
            if (member.id === course.admin.id && user?.id === member.id)
              return null;

            // Check permissions for this specific member
            const canModifyRole = canChangeRole(member.role);
            const canRemoveMember = canKickMember(member.role);

            return (
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
                            {/* Profile content remains the same */}
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

                  {canModifyRole && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          disabled={
                            changeRoleMutation.isPending &&
                            changeRoleMutation.variables?.member_id ===
                              member.id
                          }
                        >
                          {changeRoleMutation.isPending &&
                          changeRoleMutation.variables?.member_id ===
                            member.id ? (
                            <>
                              <span className="animate-pulse">Updating...</span>
                            </>
                          ) : (
                            <>
                              {getRoleLabel(member.role)}
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* Only show role options that are below the current user's role */}
                        {[1, 2, 3].map((roleLevel) => {
                          // Only show roles below the current user's role
                          if (roleLevel >= currentUserRole) return null;

                          // Don't show the current role of the member
                          if (roleLevel === member.role) return null;

                          return (
                            <DropdownMenuItem
                              key={roleLevel}
                              onClick={() =>
                                handleRoleChange(member.id, roleLevel)
                              }
                            >
                              {getRoleLabel(roleLevel)}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {canRemoveMember && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKickMember(member)}
                      className="text-red-500 hover:text-red-700"
                      disabled={
                        kickMemberMutation.isPending &&
                        memberToKick?.id === member.id
                      }
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      {kickMemberMutation.isPending &&
                      memberToKick?.id === member.id
                        ? "Processing..."
                        : "Kick"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredMembers.length === 0 && !isLoading && (
            <p className="text-center text-gray-500">No members found</p>
          )}
        </div>
      )}

      {/* Kick Confirmation Dialog */}
      {memberToKick && (
        <Dialog
          open={!!memberToKick}
          onOpenChange={(open) => !open && setMemberToKick(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Removal</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{memberToKick.username}</span>{" "}
                from the group? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMemberToKick(null)}
                className="mr-2"
                disabled={kickMemberMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmKickMember}
                disabled={kickMemberMutation.isPending}
              >
                {kickMemberMutation.isPending ? "Removing..." : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default GroupMembers;
