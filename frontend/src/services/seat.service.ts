import api from './api';
import type { Seat } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const seatService = {
  async getAvailable(seatMapId: string): Promise<Seat[]> {
    const response = await api.get<ApiResponse<Seat[]>>(`/api/seatmaps/${seatMapId}/seats/available`);
    return response.data.data;
  },

  async getSeatMap(eventId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/api/events/${eventId}/seatmap`);
    return response.data.data;
  },
};
