// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ClassroomPage from "./pages/ClassroomPage";
import { useUserStore } from "./store/userStore";
import AppLayout from "./layout/AppLayout";
import ArchivedPage from "./pages/ArchivedPage";
import ClassPage from "./pages/ClassPage";

const App: React.FC = () => {
  const { user } = useUserStore(); // Get the user from Zustand store
  
  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="/" element={<Home />} />
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<ClassroomPage />} />
            <Route path="/archived" element={<ArchivedPage />} />
            <Route path="/class/:classId" element={<ClassPage />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
