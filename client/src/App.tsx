// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ClassroomPage from "./pages/ClassroomPage";
import { useUserStore } from "./store/userStore";

const App: React.FC = () => {
  const { user } = useUserStore(); // Get the user from Zustand store
  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <ClassroomPage /> : <Home />} />
      </Routes>
    </Router>
  );
};

export default App;
