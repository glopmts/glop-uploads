import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_FILES_URL } from "../lib/api_url";
import type { ItemType } from "../types/interfaces";

interface ErrorResponse {
  message: string;
}

type UploadProgressCallback = (progress: number) => void;

export const ServicesFiles = {
  // Upload single file
  async uploadFile(
    userId: string,
    title: string,
    type: ItemType,
    folderId?: string,
    file?: File,
    onProgress?: UploadProgressCallback
  ) {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("title", title);
      formData.append("type", type);
      if (folderId) {
        formData.append("folderId", folderId);
      }

      if (file) {
        formData.append("file", file);
      }

      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      const response = await axios.post(
        `${API_FILES_URL}/files/items`,
        formData,
        config
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "File upload failed"
      );
    }
  },

  // Upload multiple files (up to 10)
  async uploadFiles(
    userId: string,
    files?: File[],
    onProgress?: UploadProgressCallback
  ) {
    try {
      const formData = new FormData();
      formData.append("userId", userId);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      const response = await axios.post(
        `${API_FILES_URL}/files/upload-multiple`,
        formData,
        config
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Multiple files upload failed"
      );
    }
  },

  // Get user folders and files
  async getUserFolders(userId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/files/userFolders/${userId}`
      );
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Failed to fetch user folders"
      );
    }
  },
};
