import { API_BASE_URL } from "@renderer/lib/api_url";
import axios, { AxiosError } from "axios";
import { ItemType } from "../types/interfaces";

interface ErrorResponse {
  message: string;
}

export const foldersServices = {
  async createFolder(
    userId: string,
    title: string,
    color: string,
    type: ItemType
  ) {
    try {
      const response = await axios.post(`${API_BASE_URL}/files/createFolder`, {
        userId,
        title,
        color,
        type,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
  async updateFolder(id: string, title: string, color: string, type: ItemType) {
    try {
      const response = await axios.put(`${API_BASE_URL}/files/updateFolder`, {
        id,
        title,
        color,
        type,
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
  async deleteFolder(Id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/files/deleteFolder/${Id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data.message || "Create folder failed"
      );
    }
  },
};
