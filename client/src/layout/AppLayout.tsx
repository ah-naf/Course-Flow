import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUserStore } from "@/store/userStore";
import { Navigate, Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { user } = useUserStore(); // Get the user from Zustand store

  if (!user) return <Navigate to={"/"} replace />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header toggleSidebar={toggleSidebar} pagePath={"ui-303"} />

        {/* Page Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
