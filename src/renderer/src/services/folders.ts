import axios, { AxiosError } from 'axios';
import { ItemType } from '../types/interfaces';

const API_BASE_URL = 'http://localhost:5001/api';


interface ErrorResponse {
  message: string;
}

export const foldersServices = {
  async createFolder(userId: string, title: string, color: string, type: ItemType) {
    try {
      const response = await axios.post(`${API_BASE_URL}/files/createFolder`, {userId, title, color, type });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data.message || 'Create folder failed');
    }
  },
}