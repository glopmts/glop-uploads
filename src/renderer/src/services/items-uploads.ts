import axios, { type AxiosError } from "axios";
import { API_BASE_URL } from "../lib/api_url";

interface ErrorResponse {
  message: string;
}

export const itemUploadsUser = {
  async getUploads(userId: string) {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/files/userItems/${userId}`
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
  async getUploadsFolder(userId: string, type: string, folderId?: string) {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/files/userItemsFolder`,
        {
          userId,
          type,
          parentId: folderId,
        }
      );
      return data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
  async deleteItem(Id: string) {
    try {
      const { data } = await axios.delete(
        `${API_BASE_URL}/files/deleteItem/${Id}`
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
};
