// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { Menu, ChevronRight, LogOut, User, BookOpen, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/userStore";
import AddClassDialog from "@/components/AddClassDialog";
import NotificationDialog from "@/components/NotificationDialog"; // Import the new component
import ProfileDialog from "./ProfileDialog";
import { useLogout } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Notification } from "@/utils/types";
import { useNotificationStore } from "@/store/notificationStore";

interface HeaderProps {
  toggleSidebar: () => void;
  pagePath?: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, pagePath = "" }) => {
  const { user, logout } = useUserStore();
  const { addNotification } = useNotificationStore();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Get the access token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found in localStorage");
      return;
    }

    // Create WebSocket connection
    const websocket = new WebSocket(
      `ws://localhost:8080/api/v1/ws?token=${token}`
    );

    // Set the Authorization header (Note: WebSocket in browsers doesn't support headers directly,
    // so we may need to pass the token in a different way depending on the backend setup.
    // For now, we'll assume the backend extracts it from a query param or handles it via the initial connection.)
    websocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocket.onmessage = (event) => {
      console.log("Received WebSocket message:", event.data);
      const data = JSON.parse(event.data) as Notification;
      console.log(data);
      addNotification(data);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Store the WebSocket instance in state
    setWs(websocket);

    // Cleanup on component unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleLogout = () => {
    const token = localStorage.getItem("refresh_token");
    if (!token) {
      logout();
      return;
    }
    logoutMutation.mutate(
      {
        refresh_token: token,
      },
      {
        onSuccess: () => {
          logout();
        },
      }
    );

    setTimeout(() => navigate("/"), 500);
  };

  if (!user) return null;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mr-2 hover:bg-gray-100"
        title="Toggle Sidebar"
        aria-label="Toggle sidebar navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center text-lg font-medium">
        <Link to={"/"} className="text-gray-600 flex items-center mx-1">
          <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
        </Link>
        {pagePath && (
          <React.Fragment>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to={`/class/${pagePath}`} className="text-gray-600">
              {pagePath}
            </Link>
          </React.Fragment>
        )}
      </div>

      <div className="ml-auto flex items-center space-x-3">
        {location.pathname === "/" && (
          <AddClassDialog>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
              title="Add New Class"
              aria-label="Add a new class or join an existing one"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </AddClassDialog>
        )}

        {/* Use the NotificationDialog component */}
        <NotificationDialog />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9 ring-2 ring-blue-500 ring-offset-2">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-blue-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <div className="flex items-center p-2 mb-2">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-xs text-gray-500 mt-1 bg-gray-200 p-1 rounded font-semibold">
                  {user.username}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center p-2 cursor-pointer"
              onClick={() => setIsProfileDialogOpen(true)}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center p-2 cursor-pointer text-red-500 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
      />
    </header>
  );
};

export default Header;
