import axiosInstance from "@/api/axiosInstance";
import { useUserStore } from "@/store/userStore";
import { User } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse extends User {
  access_token: string;
  refresh_token: string;
}

interface LogoutData {
  refresh_token: string;
}

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await axiosInstance.post<RegisterResponse>(
          "/api/auth/register",
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error: string }>;
          throw new Error(
            axiosError.response?.data?.error || "Registration failed"
          );
        }
        throw new Error("Registration failed");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Registration successful!", {
        description: "You can now log in with your new account.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Registration failed", {
        description: "Please try again or check your input.",
      });
    },
  });
};

export const useLogin = () => {
  const { setUser } = useUserStore();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (data: LoginData) => {
      try {
        const response = await axiosInstance.post<LoginResponse>(
          "/api/auth/login",
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error: string }>;
          throw new Error(axiosError.response?.data?.error || "Login failed");
        }
        throw new Error("Login failed");
      }
    },
    onSuccess: (data) => {
      toast.success("Login successful!", {
        description: `Welcome Back, ${data.lastName}!`,
      });

      setTimeout(() => {
        const { access_token, refresh_token, ...user } = data;
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setUser(user);
      }, 1000);
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Login failed", {
        description: "Please check your credentials and try again.",
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useUserStore();
  return useMutation<{ message: string }, Error, LogoutData>({
    mutationFn: async (data: LogoutData) => {
      try {
        const response = await axiosInstance.post<{ message: string }>(
          "/api/auth/logout",
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error: string }>;
          throw new Error(axiosError.response?.data?.error || "Logout failed");
        }
        throw new Error("Logout failed");
      }
    },
    onSuccess: (data) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      toast.success(data.message || "Logged out successfully!", {
        description: "You've been signed out of your account.",
      });
      logout();
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed", {
        description:
          "An error occurred while trying to log out. Please try again.",
      });
      // logout();
    },
  });
};
