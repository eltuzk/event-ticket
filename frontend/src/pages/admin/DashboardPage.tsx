import React, { useEffect, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { reportService, type OverallStats } from '../../services/report.service';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await reportService.getOverallRevenue();
      setStats(data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-[2rem]" />
      </div>
    );
  }

  const statCards = [
    { label: 'Tổng doanh thu', value: `${stats?.totalRevenue.toLocaleString('vi-VN')}đ`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tổng sự kiện', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Vé đã bán', value: stats?.totalTicketsSold || 0, icon: Ticket, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Người dùng', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-slate-500 mt-1">Theo dõi các chỉ số quan trọng và doanh thu</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <TrendingUp size={20} className="text-indigo-600" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Doanh thu theo thời gian</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full">
              <ArrowUpRight size={14} />
              +12% so với tháng trước
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueByDate || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  tickFormatter={(val) => `${val/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`${val?.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Sự kiện nổi bật</h3>
            <button className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-6">
            {stats?.topEvents.map((event, i) => (
              <div key={event.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{event.title}</h4>
                  <p className="text-xs text-slate-500">{event.ticketsSold} vé đã bán</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{Math.round(event.revenue / 1000000)}M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
