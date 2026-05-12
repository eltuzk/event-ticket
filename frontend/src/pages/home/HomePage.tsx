import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { eventService } from '../../services/event.service';
import { categoryService } from '../../services/category.service';
import type { Event, Category } from '../../types';
import { EventStatus } from '../../types';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.getAll({
        status: EventStatus.PUBLISHED,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
      });
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to fetch events', err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 px-8 py-16 text-center text-white">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Khám phá những sự kiện <span className="text-indigo-300">tuyệt vời nhất</span>
          </h1>
          <p className="text-lg text-indigo-100/80">
            Tìm kiếm và đặt vé cho các buổi hòa nhạc, hội thảo, và nhiều sự kiện giải trí khác ngay hôm nay.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
              <input
                type="text"
                placeholder="Tìm tên sự kiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/60 pl-10 py-3"
              />
            </div>
            <button 
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-xl font-semibold transition-all active:scale-95"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
          <Filter size={18} className="text-slate-400 mr-2 shrink-0" />
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </button>
          {Array.isArray(categories) && categories.map((cat) => {
            if (!cat || !cat.id) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        
        {selectedCategory && (
          <button 
            onClick={fetchEvents}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Áp dụng bộ lọc
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-medium">
          <p>Lỗi: {error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-4">
              <div className="aspect-[16/9] bg-slate-200 rounded-2xl w-full" />
              <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
              <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : Array.isArray(events) && events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => {
            if (!event || !event.id) return null;
            return (
              <Link 
                key={event.id} 
                to={`/events/${event.id}`}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all active:scale-[0.98]"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'} 
                    alt={event.title || 'Sự kiện'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                    {event.category?.name || 'Sự kiện'}
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {event.title || 'Không có tiêu đề'}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      <span>{event.startDate ? new Date(event.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{event.location || 'Chưa có địa điểm'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Giá từ</span>
                    <span className="text-lg font-extrabold text-indigo-600">Miễn phí</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Không tìm thấy sự kiện nào phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
