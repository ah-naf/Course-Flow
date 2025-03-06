// ClassBanner.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, MoreHorizontal, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Course } from "@/utils/types";
import { ClassSettingsDialog } from "./ClassSettingsDialog";

interface ClassBannerProps {
  course: Course;
  showJoinDetails: boolean;
  setIsJoinDetailsDialogOpen: (open: boolean) => void;
  isJoinDetailsDialogOpen: boolean;
}

export const ClassBanner: React.FC<ClassBannerProps> = ({
  course,
  showJoinDetails,
  setIsJoinDetailsDialogOpen,
  isJoinDetailsDialogOpen,
}) => {
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const copyJoinCode = () => {
    if (course.joinCode) {
      navigator.clipboard.writeText(course.joinCode);
      setCopiedJoinCode(true);
      setTimeout(() => setCopiedJoinCode(false), 2000);
    }
  };

  const copyInviteLink = () => {
    if (course.inviteLink) {
      navigator.clipboard.writeText(course.inviteLink);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 2000);
    }
  };

  return (
    <div
      className="h-80 md:h-56 lg:h-68 w-full bg-cover bg-center rounded-lg mb-6 relative overflow-hidden"
      style={{
        backgroundImage: course.coverPic
          ? `url(${course.coverPic})`
          : undefined,
        backgroundColor: !course.coverPic ? course.backgroundColor : undefined,
      }}
    >
      <div className="absolute top-4 right-4 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/80 hover:bg-white text-gray-800 rounded-full h-10 w-10 cursor-pointer"
                onClick={() => setIsSettingsDialogOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Class Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ClassSettingsDialog
          course={course}
          isOpen={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        />
      </div>

      <div className="absolute inset-0 flex items-end p-6">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {course.name}
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white p-0 h-auto mt-2 md:mt-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="ml-1 text-sm">Learn More</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4 bg-gray-800 text-white border-none">
                  <p>{course.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {showJoinDetails && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog
                    open={isJoinDetailsDialogOpen}
                    onOpenChange={setIsJoinDetailsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800 cursor-pointer"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Join Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] w-[90vw] rounded-lg">
                      <DialogHeader>
                        <DialogTitle className="text-2xl sm:text-3xl font-semibold">
                          Join {course.name}
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-gray-600">
                          Share these details with students to join your class.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-700">
                              Join Code
                            </h4>
                          </div>
                          <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                            <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                              {course.joinCode}
                            </code>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyJoinCode}
                                    className="flex items-center"
                                  >
                                    {copiedJoinCode ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                    <span className="ml-2 hidden sm:inline">
                                      {copiedJoinCode ? "Copied" : "Copy Code"}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {copiedJoinCode
                                      ? "Copied to clipboard!"
                                      : "Copy join code"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        {course.inviteLink && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-700">
                                Invitation Link
                              </h4>
                            </div>
                            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                              <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono truncate max-w-[200px] sm:max-w-[300px]">
                                {course.inviteLink}
                              </code>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={copyInviteLink}
                                      className="flex items-center"
                                    >
                                      {copiedInviteLink ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                      <span className="ml-2 hidden sm:inline">
                                        {copiedInviteLink
                                          ? "Copied"
                                          : "Copy Link"}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {copiedInviteLink
                                        ? "Copied to clipboard!"
                                        : "Copy invitation link"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View class join details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};
