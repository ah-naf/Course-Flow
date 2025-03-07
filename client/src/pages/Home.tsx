// src/pages/Home.tsx
import React, { useState } from "react";
import AuthModal from "@/components/AuthModal";
import HeroBg from "../assets/hero-bg.svg";

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${HeroBg})` }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to My Classroom</h1>
        <p className="text-xl mb-8">Collaborate, learn, and grow together.</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition"
        >
          Login / Register
        </button>
      </div>

      {/* Auth Modal */}
      {isModalOpen && (
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Home;
