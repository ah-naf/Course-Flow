import { RefreshTokenResponse } from "@/utils/types";
import axios from "axios";

export const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  // Retrieve the refresh token from localStorage
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) {
    throw new Error("No refresh token found");
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      "http://localhost:8080/api/auth/refresh",
      { refresh_token }
    );

    // Update tokens in localStorage
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Token refresh failed");
    }
    throw new Error("Token refresh failed");
  }
};
