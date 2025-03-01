import React from "react";
import {
  Menu,
  ChevronRight,
  Bell,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
  pageTitle?: string;
  pagePath?: string[];
}

const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  pageTitle = "Home",
  pagePath = ["Learning Hub"],
}) => {
  // Current user info - this could come from a context or props
  const currentUser = {
    name: "John Doe",
    avatar: "",
    initials: "JD",
    role: "Instructor & Student",
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mr-2 hover:bg-gray-100"
        title="Toggle Sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center text-lg font-medium">
        {pagePath.map((item, index) => (
          <React.Fragment key={index}>
            <span
              className={index < pagePath.length - 1 ? "" : "text-gray-600"}
            >
              {item}
            </span>
            {index < pagePath.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-1" />
            )}
          </React.Fragment>
        ))}
        {pageTitle && pagePath.length === 0 && (
          <span className="text-gray-600">{pageTitle}</span>
        )}
      </div>

      <div className="ml-auto flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          title="Add New"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9 ring-2 ring-blue-500 ring-offset-2">
              <AvatarImage src="/api/placeholder/30/30" />
              <AvatarFallback className="bg-blue-600 text-white">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="flex items-center p-2 mb-2">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-blue-600 text-white">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center p-2 cursor-pointer">
              <User className="h-4 w-4 mr-3" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center p-2 cursor-pointer">
              <Settings className="h-4 w-4 mr-3" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center p-2 cursor-pointer text-red-500 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-3" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
