// src/components/NotificationDialog.tsx
import React from "react";
import { Bell, MessageSquare, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notificationStore";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

const NotificationDialog: React.FC = () => {
  const { notifications, markAsRead, getTotalUnreadCount } =
    useNotificationStore();
  const unreadCount = getTotalUnreadCount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 relative"
          title="Notifications"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-2 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-lg font-semibold">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex items-start p-3 cursor-pointer rounded-md transition-colors ${
                notification.read
                  ? "bg-gray-50"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >
              <div className="mr-3 mt-1">
                {notification.type === "chat" && (
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                )}
                {notification.type === "video_call" && (
                  <Video className="h-5 w-5 text-green-500" />
                )}
                {notification.type === "class_post" && (
                  <FileText className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(notification.timestamp)}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDialog;
