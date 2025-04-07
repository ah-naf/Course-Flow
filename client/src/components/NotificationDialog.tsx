// src/components/NotificationDialog.tsx
import React from "react";
import {
  Bell,
  MessageSquare,
  FileText,
  CheckCircle,
  UserMinus,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notificationStore";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { cn } from "@/lib/utils";
import {
  useClearAllNotifications,
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/hooks/useNotification";

const NotificationDialog: React.FC = () => {
  const { isLoading: isFetching } = useGetNotifications();
  const { mutate: markAsRead, isPending: isMarkingOne } =
    useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } =
    useMarkAllNotificationsAsRead();
  const { mutate: clearAll, isPending: isClearing } =
    useClearAllNotifications();

  const { notifications, getTotalUnreadCount } = useNotificationStore();
  const unreadCount = getTotalUnreadCount();

  const handleMarkAllAsRead = () => markAllAsRead();
  const handleClearAll = () => clearAll();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message_sent":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "post_created":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "role_changed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "user_kicked":
        return <UserMinus className="h-5 w-5 text-red-500" />; // Red for removal
      case "comment_added":
        return <MessageCircle className="h-5 w-5 text-indigo-500" />; // Indigo for discussion
      default:
        console.log(type);
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Notifications"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full text-xs font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 max-h-[calc(100vh-100px)] overflow-y-auto shadow-lg rounded-lg border border-gray-200"
      >
        <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
          <DropdownMenuLabel className="text-lg font-semibold text-gray-800">
            Notifications
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <div className="flex justify-between mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isMarkingAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {isMarkingAll ? "Marking..." : "Mark All as Read"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-xs text-red-600 hover:text-red-800"
              >
                {isClearing ? "Clearing..." : "Clear All"}
              </Button>
            </div>
          )}
        </div>

        {isFetching && !notifications.length && (
          <div className="flex items-center justify-center p-4">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        )}

        {!isFetching && notifications.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications yet
          </div>
        )}

        {!isFetching && notifications.length > 0 && (
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() =>
                  !notification.read && markAsRead(notification.id)
                }
                disabled={isMarkingOne}
                className={cn(
                  "flex items-start p-3 cursor-pointer transition-colors",
                  notification.read
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-blue-50 hover:bg-blue-100"
                )}
              >
                <div className="mr-3 mt-1 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(notification.timestamp)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="ml-2 flex-shrink-0">
                    <span className="h-2 w-2 bg-blue-500 rounded-full" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDialog;
