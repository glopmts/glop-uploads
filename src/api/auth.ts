import { API_BASE_URL } from "@renderer/lib/api_url";
import axios, { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface ErrorResponse {
  message: string;
}

export const authService = {
  async register(name: string, email: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Registration failed"
      );
    }
  },

  async requestVerificationCode(email: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/request-code`, { email });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message ||
          "Failed to request verification code"
      );
    }
  },

  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-code`, {
        email,
        code,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Verification failed"
      );
    }
  },

  async login(email: string, code: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        code,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data.message || "Login failed");
    }
  },

  async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Failed to refresh token"
      );
    }
  },
};
