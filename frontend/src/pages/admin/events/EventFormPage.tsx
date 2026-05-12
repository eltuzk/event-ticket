import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventService } from '../../../services/event.service';
import { categoryService } from '../../../services/category.service';
import { seatMapService } from '../../../services/seatmap.service';
import type { Category } from '../../../types';
import { toast } from 'sonner';
import { ChevronLeft, Save, Layout, Calendar, MapPin, Tag, Armchair } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  location: z.string().min(5, 'Địa điểm phải có ít nhất 5 ký tự'),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

const EventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Event Details, 2: Seat Map
  const [createdEventId, setCreatedEventId] = useState<string | null>(id || null);

  // Seat Map State
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [price, setPrice] = useState(100000);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchEventData(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEventData = async (eventId: string) => {
    try {
      const data = await eventService.getById(eventId);
      reset({
        title: data.title,
        description: data.description,
        categoryId: data.category.id,
        startDate: new Date(data.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.endDate).toISOString().slice(0, 16),
        location: data.location,
        imageUrl: data.imageUrl || '',
      });
      
      // Fetch seat map if editing
      try {
        const sm = await seatMapService.getByEventId(eventId);
        setRows(sm.totalRows);
        setCols(sm.totalColumns);
        if (sm.seats.length > 0) setPrice(sm.seats[0].price);
      } catch (e) {
        // Seat map might not exist yet
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu sự kiện.');
    }
  };

  const onSubmitEvent = async (data: EventFormData) => {
    setLoading(true);
    try {
      if (id) {
        await eventService.update(id, data);
        toast.success('Cập nhật sự kiện thành công!');
        setStep(2);
      } else {
        const newEvent = await eventService.create(data);
        setCreatedEventId(newEvent.id);
        toast.success('Tạo sự kiện thành công! Hãy thiết lập sơ đồ ghế.');
        setStep(2);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeatMap = async () => {
    if (!createdEventId) return;
    setLoading(true);
    try {
      // Check if seat map exists
      let exists = false;
      try {
        await seatMapService.getByEventId(createdEventId);
        exists = true;
      } catch (e) {}

      if (exists) {
        await seatMapService.update(createdEventId, { totalRows: rows, totalColumns: cols, price });
      } else {
        await seatMapService.create(createdEventId, { totalRows: rows, totalColumns: cols, price });
      }
      
      toast.success('Lưu sơ đồ ghế thành công!');
      navigate('/admin/events');
    } catch (error) {
      toast.error('Lỗi khi lưu sơ đồ ghế.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Quay lại danh sách</span>
        </button>
        
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'}`}>
            {step === 1 ? '1' : '✓'}
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            2
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white shadow-sm text-indigo-600">
            {step === 1 ? <Calendar size={24} /> : <Layout size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 1 ? (id ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới') : 'Cấu hình sơ đồ ghế'}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 1 ? 'Nhập thông tin cơ bản về sự kiện' : 'Thiết lập số lượng chỗ ngồi và giá vé'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleSubmit(onSubmitEvent)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    Tên sự kiện
                  </label>
                  <input 
                    {...register('title')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="VD: Nhạc hội EDM 2026"
                  />
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Mô tả chi tiết</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Giới thiệu về sự kiện của bạn..."
                  />
                  {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Danh mục</label>
                  <select 
                    {...register('categoryId')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-xs text-red-500 font-medium">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={16} className="text-indigo-500" />
                    Địa điểm
                  </label>
                  <input 
                    {...register('location')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="VD: Sân vận động Mỹ Đình"
                  />
                  {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Ngày bắt đầu</label>
                  <input 
                    type="datetime-local"
                    {...register('startDate')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.startDate && <p className="text-xs text-red-500 font-medium">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Ngày kết thúc</label>
                  <input 
                    type="datetime-local"
                    {...register('endDate')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {errors.endDate && <p className="text-xs text-red-500 font-medium">{errors.endDate.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Link ảnh bìa (URL)</label>
                  <input 
                    {...register('imageUrl')}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && <p className="text-xs text-red-500 font-medium">{errors.imageUrl.message}</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? 'Đang lưu...' : 'Tiếp tục bước 2'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Số hàng</label>
                  <input 
                    type="number"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Số cột</label>
                  <input 
                    type="number"
                    value={cols}
                    onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Giá vé mặc định (VNĐ)</label>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Xem trước sơ đồ (Gồm {rows * cols} ghế)</h3>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 overflow-x-auto min-h-[200px] flex items-center justify-center">
                  <div 
                    className="grid gap-1.5" 
                    style={{ gridTemplateColumns: `repeat(${Math.min(cols, 20)}, 1fr)` }}
                  >
                    {[...Array(Math.min(rows * cols, 400))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[8px] text-slate-400">
                        <Armchair size={10} />
                      </div>
                    ))}
                    {rows * cols > 400 && <div className="text-xs text-slate-400 italic">Và còn {(rows * cols) - 400} ghế khác...</div>}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Quay lại bước 1
                </button>
                <button 
                  onClick={handleSaveSeatMap}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? 'Đang lưu...' : 'Hoàn tất & Lưu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventFormPage;
