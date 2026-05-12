import api from './api';
import type { Ticket } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const ticketService = {
  async create(seatId: string, eventId: string): Promise<Ticket> {
    const response = await api.post<ApiResponse<Ticket>>('/api/tickets', { seatId, eventId });
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
    const response = await api.post<ApiResponse<{ qrCode: string }>>('/api/qrcodes/generate', { ticketId });
    // result from QRCodeService.generate is likely { qrCode: "base64..." } or just the string
    // Let's assume it returns { qrCode: "..." } based on common patterns
    return response.data.data.qrCode;
  },
};
