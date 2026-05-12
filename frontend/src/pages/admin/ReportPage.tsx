import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Filter, 
  Download, 
  ChevronDown,
  FileText
} from 'lucide-react';
import { reportService } from '../../services/report.service';
import { eventService } from '../../services/event.service';
import type { Event } from '../../types';
import { toast } from 'sonner';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const ReportPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchReport();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (selectedEventId) {
        const data = await reportService.getRevenueByEvent(selectedEventId);
        setReportData(data);
      } else {
        const data = await reportService.getRevenueByDateRange(startDate, endDate);
        setReportData(data);
      }
    } catch (error) {
      toast.error('Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    toast.info('Tính năng xuất báo cáo PDF đang được phát triển.');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Báo cáo doanh thu</h1>
          <p className="text-slate-500 mt-1">Phân tích chi tiết hiệu quả kinh doanh</p>
        </div>
        
        <button 
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold transition-all hover:bg-slate-50 shadow-sm"
        >
          <Download size={20} />
          Xuất PDF
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sự kiện</label>
          <div className="relative">
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-medium text-slate-700"
            >
              <option value="">Tất cả sự kiện</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Từ ngày</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Đến ngày</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          />
        </div>

        <button 
          onClick={fetchReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Filter size={18} />
          Áp dụng
        </button>
      </div>

      {loading ? (
        <div className="h-96 bg-white border border-slate-200 rounded-[2rem] animate-pulse" />
      ) : (
        <div className="space-y-8">
          {/* Main Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Thống kê doanh thu</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.revenueByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {reportData?.revenueByDate?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
              <FileText className="text-indigo-600" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Bảng dữ liệu chi tiết</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Thời gian / Sự kiện</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Số vé bán</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Tỷ lệ sử dụng</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Mocking detailed rows based on reportData */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-900">
                      {selectedEventId ? reportData?.eventTitle : 'Tổng cộng tất cả sự kiện'}
                    </td>
                    <td className="px-8 py-4 text-center text-slate-600">
                      {reportData?.ticketsSold || 0} vé
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${reportData?.ticketsSold ? Math.round((reportData.ticketsScanned / reportData.ticketsSold) * 100) : 0}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          {reportData?.ticketsSold ? Math.round((reportData.ticketsScanned / reportData.ticketsSold) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right font-black text-indigo-600">
                      {(reportData?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
