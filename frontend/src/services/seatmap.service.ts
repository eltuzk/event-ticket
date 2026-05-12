import api from './api';
import type { SeatMap } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const seatMapService = {
  async getByEventId(eventId: string): Promise<SeatMap> {
    const response = await api.get<ApiResponse<SeatMap>>(`/api/events/${eventId}/seatmap`);
    return response.data.data;
  },

  async create(eventId: string, data: { totalRows: number; totalColumns: number; price: number }): Promise<SeatMap> {
    const response = await api.post<ApiResponse<SeatMap>>(`/api/events/${eventId}/seatmap`, data);
    return response.data.data;
  },

  async update(eventId: string, data: { totalRows: number; totalColumns: number; price: number }): Promise<SeatMap> {
    const response = await api.put<ApiResponse<SeatMap>>(`/api/events/${eventId}/seatmap`, data);
    return response.data.data;
  },
};
