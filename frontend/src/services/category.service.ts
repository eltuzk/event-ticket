import api from './api';
import type { Category } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/api/categories');
    return response.data.data;
  },
};
