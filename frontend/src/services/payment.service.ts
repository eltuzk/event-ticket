import api from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const paymentService = {
  async createPaymentUrl(ticketIds: string[], amount: number): Promise<{ paymentUrl: string }> {
    const response = await api.post<ApiResponse<{ paymentUrl: string }>>('/api/payments/create-payment-url', {
      ticketIds,
      amount,
    });
    return response.data.data;
  },

  async getMyPayments(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>('/api/payments/my');
    return response.data.data;
  },
};
