import api from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface OverallStats {
  totalRevenue: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalUsers: number;
  revenueByDate: Array<{ date: string; amount: number }>;
  topEvents: Array<{ id: string; title: string; revenue: number; ticketsSold: number }>;
  revenueGrowthPercentage?: number;
}

export interface EventReport {
  eventId: string;
  eventTitle: string;
  totalRevenue: number;
  ticketsSold: number;
  ticketsScanned: number;
  revenueByDate: Array<{ date: string; amount: number }>;
}

export const reportService = {
  async getOverallRevenue(): Promise<OverallStats> {
    const response = await api.get<ApiResponse<OverallStats>>('/api/reports/overall');
    return response.data.data;
  },

  async getRevenueByEvent(eventId: string): Promise<EventReport> {
    const response = await api.get<ApiResponse<EventReport>>(`/api/reports/event/${eventId}`);
    return response.data.data;
  },

  async getRevenueByDateRange(startDate: string, endDate: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/api/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data.data;
  },
};
