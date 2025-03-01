// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ClassroomPage from "./pages/ClassroomPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/class" element={<ClassroomPage />} />
        {/* You can add more routes here */}
      </Routes>
    </Router>
  );
};

export default App;
