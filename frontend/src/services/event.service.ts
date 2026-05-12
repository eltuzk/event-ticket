import api from './api';
import type { Event, EventStatusType } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const eventService = {
  async getAll(params?: {
    search?: string;
    categoryId?: string;
    status?: EventStatusType;
    organizerId?: string;
  }): Promise<Event[]> {
    const response = await api.get<ApiResponse<Event[]>>('/api/events', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Event> {
    const response = await api.get<ApiResponse<Event>>(`/api/events/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Event>): Promise<Event> {
    const response = await api.post<ApiResponse<Event>>('/api/events', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Event>): Promise<Event> {
    const response = await api.put<ApiResponse<Event>>(`/api/events/${id}`, data);
    return response.data.data;
  },

  async publish(id: string): Promise<void> {
    await api.patch(`/api/events/${id}/publish`);
  },

  async cancel(id: string): Promise<void> {
    await api.patch(`/api/events/${id}/cancel`);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/events/${id}`);
  },
};
