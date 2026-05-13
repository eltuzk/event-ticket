import api from './api';
import type { Ticket } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const ticketService = {
  async create(seatIds: string[], eventId: string): Promise<Ticket[]> {
    const response = await api.post<ApiResponse<Ticket[]>>('/api/tickets', { seatIds, eventId });
    return response.data.data;
  },

  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get<ApiResponse<Ticket[]>>('/api/tickets/my');
    return response.data.data;
  },

  async cancel(id: string): Promise<void> {
    await api.patch(`/api/tickets/${id}/cancel`);
  },

  async getQRCode(ticketId: string): Promise<string> {
    const response = await api.post<ApiResponse<{ qrCode: any; qrImage: string }>>('/api/qrcodes/generate', { ticketId });
    return response.data.data.qrImage;
  },
};
