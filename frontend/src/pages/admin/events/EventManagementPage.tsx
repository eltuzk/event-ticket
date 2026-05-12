import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { eventService } from '../../../services/event.service';
import { useAuthStore } from '../../../stores/auth.store';
import type { Event } from '../../../types';
import { UserRole } from '../../../types';
import EventTable from '../../../components/admin/EventTable';
import { toast } from 'sonner';

const EventManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const filters: any = {};
      // If organizer, only show their events
      if (user?.role === UserRole.ORGANIZER) {
        filters.organizerId = user.id;
      }
      
      const data = await eventService.getAll(filters);
      setEvents(data);
    } catch (error) {
      toast.error('Không thể tải danh sách sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await eventService.publish(id);
      toast.success('Sự kiện đã được đăng bản công khai!');
      fetchEvents();
    } catch (error) {
      toast.error('Lỗi khi xuất bản sự kiện.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy sự kiện này?')) return;
    try {
      await eventService.cancel(id);
      toast.success('Sự kiện đã được hủy.');
      fetchEvents();
    } catch (error) {
      toast.error('Lỗi khi hủy sự kiện.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) return;
    try {
      await eventService.delete(id);
      toast.success('Sự kiện đã được xóa.');
      fetchEvents();
    } catch (error) {
      toast.error('Lỗi khi xóa sự kiện.');
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Sự kiện</h1>
          <p className="text-slate-500 mt-1">
            {user?.role === UserRole.ADMIN ? 'Tất cả sự kiện trên hệ thống' : 'Danh sách sự kiện của bạn'}
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/events/new')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          Thêm sự kiện mới
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm theo tên hoặc địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all">
          <Filter size={18} />
          Bộ lọc
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <EventTable 
          events={filteredEvents}
          onEdit={(id) => navigate(`/admin/events/edit/${id}`)}
          onPublish={handlePublish}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default EventManagementPage;
