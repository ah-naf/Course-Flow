import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { refreshAccessToken } from "./api";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1", // your API base URL
});

// Add a request interceptor to set the Authorization header from localStorage
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for refreshing tokens on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response, // Return response normally if no error.
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call the refresh token function to get new tokens.
        const refreshResponse = await refreshAccessToken();

        // Update localStorage with the new tokens
        localStorage.setItem("access_token", refreshResponse.access_token);
        localStorage.setItem("refresh_token", refreshResponse.refresh_token);

        // Update the Authorization header for the original request
        if (originalRequest.headers) {
          // For AxiosRequestConfig
          (
            originalRequest.headers as Record<string, string>
          ).Authorization = `Bearer ${refreshResponse.access_token}`;
        }

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, handle the error (e.g., force logout)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
