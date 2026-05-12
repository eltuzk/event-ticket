import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Tag, ChevronLeft, Ticket } from 'lucide-react';
import { eventService } from '../../services/event.service';
import { useAuthStore } from '../../stores/auth.store';
import type { Event } from '../../types';
import { toast } from 'sonner';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetail(id);
    }
  }, [id]);

  const fetchEventDetail = async (eventId: string) => {
    try {
      const data = await eventService.getById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event details', error);
      toast.error('Không thể tải thông tin sự kiện.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để tiếp tục mua vé.');
      navigate('/login', { state: { from: `/events/${id}/seats` } });
      return;
    }
    navigate(`/events/${id}/seats`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-pulse space-y-8">
        <div className="h-10 w-24 bg-slate-200 rounded-lg" />
        <div className="aspect-[21/9] bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-32 bg-slate-200 rounded-lg w-full" />
          </div>
          <div className="h-48 bg-slate-200 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
      >
        <div className="p-2 rounded-full group-hover:bg-indigo-50">
          <ChevronLeft size={20} />
        </div>
        <span className="font-medium">Quay lại</span>
      </button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img 
              src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Tag size={12} />
                {event.category?.name || 'Sự kiện'}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                {event.title}
              </h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Giới thiệu sự kiện</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar Info */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4">
              Chi tiết thời gian & Địa điểm
            </h3>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 h-fit">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ngày diễn ra</p>
                  <p className="font-bold text-slate-900">{new Date(event.startDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 h-fit">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thời gian</p>
                  <p className="font-bold text-slate-900">
                    {new Date(event.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 h-fit">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Địa điểm</p>
                  <p className="font-bold text-slate-900">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                onClick={handleBuyTicket}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                <Ticket size={22} />
                Chọn ghế & Mua vé
              </button>
              <p className="text-center text-xs text-slate-400 mt-4 px-4">
                Bằng việc nhấn nút, bạn đồng ý với Điều khoản & Chính sách của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
