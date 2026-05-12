import api from './api';
import type { User, AuthResponse, UserRoleType } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });
    return response.data.data;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    role: UserRoleType;
  }): Promise<void> {
    await api.post('/api/auth/register', data);
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/api/auth/me');
    return response.data.data;
  },
};
