import axiosInstance from "@/api/axiosInstance";
import { useUserStore } from "@/store/userStore";
import { User } from "@/utils/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface EditUserData {
  first_name: string;
  last_name: string;
  avatar: File | undefined;
}

export const useEditUserDetails = () => {
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation<User, Error, EditUserData>({
    mutationFn: async (data: EditUserData) => {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      try {
        const response = await axiosInstance.put<User>(
          "/users/edit",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error: string }>;
          throw new Error(
            axiosError.response?.data?.error || "Failed to update user details"
          );
        }
        throw new Error("Failed to update user details");
      }
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["courses", false] }); // Refresh ClassroomPage
      queryClient.invalidateQueries({ queryKey: ["courses", true] }); // Refresh ArchivedPage
      queryClient.invalidateQueries({ queryKey: ["teachingCourses"] });

      toast.success("Profile updated successfully!", {
        description: `Your details have been saved, ${updatedUser.firstName}!`,
      });
      setUser(updatedUser); // Update the user in the store with the latest data
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to update profile", {
        description: "Please try again or check your input.",
      });
    },
  });
};

export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await axiosInstance.post<RegisterResponse>(
          "/auth/register",
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
          "/auth/login",
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
          "/auth/logout",
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ error: string }>;
          if (axiosError.response?.status === 403) {
            return { message: "Logged out successfully!" };
          }
          throw new Error(axiosError.response?.data?.error || "Logout failed");
        }
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      logout();
    },
    onError: () => {
      logout();
    },
  });
};
