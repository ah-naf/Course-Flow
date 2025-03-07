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

export const useRegister = () => {
  const { setUser } = useUserStore();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await axios.post<RegisterResponse>(
          "http://localhost:8080/api/auth/register",
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
