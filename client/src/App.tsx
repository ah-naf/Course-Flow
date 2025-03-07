// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ClassroomPage from "./pages/ClassroomPage";
import AppLayout from "./layout/AppLayout";
import ArchivedPage from "./pages/ArchivedPage";
import ClassPage from "./pages/ClassPage";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const { user } = useUserStore();

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
