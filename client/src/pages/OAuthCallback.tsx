// src/pages/OAuthCallback.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("OAuth login failed", {
        description: error,
      });
      navigate("/login"); // Consistent with your routing
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // Fetch user data from backend
      axiosInstance
        .get("/users/me")
        .then((response) => {
          const user = response.data;
          setUser(user); // Update user store
          toast.success("Login successful!", {
            description: `Welcome back, ${user.lastName}!`,
          });
          navigate("/");
        })
        .catch((err) => {
          toast.error("Failed to fetch user data", {
            description: err.response?.data?.error || "An error occurred",
          });
          // Clear tokens on failure
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          delete axiosInstance.defaults.headers.common["Authorization"]; // Reset header
          navigate("/");
        });
    } else {
      toast.error("Missing tokens", {
        description: "OAuth login did not return expected tokens",
      });
      navigate("/");
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Processing OAuth login...</p>
    </div>
  );
};

export default OAuthCallback;
