// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ClassroomPage from "./pages/ClassroomPage";
import AppLayout from "./layout/AppLayout";
import ArchivedPage from "./pages/ArchivedPage";
import ClassPage from "./pages/ClassPage";
import OAuthCallback from "./pages/OAuthCallback";
import { useUserStore } from "./store/userStore";
import CourseJoin from "./pages/CourseJoin";

const App: React.FC = () => {
  const { user } = useUserStore();

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<ClassroomPage />} />
            <Route path="/archived" element={<ArchivedPage />} />
            <Route path="/class/:classId" element={<ClassPage />} />
            <Route path="/join/:joinCode" element={<CourseJoin />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
