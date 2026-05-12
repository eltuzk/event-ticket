import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seatService } from '../../services/seat.service';
import { ticketService } from '../../services/ticket.service';
import { paymentService } from '../../services/payment.service';
import { eventService } from '../../services/event.service';
import type { SeatMap, Seat, Event } from '../../types';
import { toast } from 'sonner';
import { ChevronLeft, Armchair, CheckCircle2, CreditCard } from 'lucide-react';

const SeatSelectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (eventId: string) => {
    try {
      const [eventData, mapData] = await Promise.all([
        eventService.getById(eventId),
        seatService.getSeatMap(eventId),
      ]);
      setEvent(eventData);
      setSeatMap(mapData);
    } catch (error) {
      console.error('Failed to fetch seat map', error);
      toast.error('Không thể tải sơ đồ ghế.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeat(selectedSeat?.id === seat.id ? null : seat);
  };

  const handleBooking = async () => {
    if (!selectedSeat || !id) return;

    setIsBooking(true);
    try {
      // 1. Create Ticket
      const ticket = await ticketService.create(selectedSeat.id, id);
      toast.success('Đã giữ chỗ thành công! Đang chuyển đến trang thanh toán...');

      // 2. Create Payment URL
      const { paymentUrl } = await paymentService.createPaymentUrl(ticket.id, selectedSeat.price);
      
      // 3. Redirect to VNPay
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt vé.');
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="w-64 h-64 bg-slate-100 rounded-full mb-8" />
        <div className="h-8 bg-slate-100 rounded w-48 mb-4" />
        <div className="h-4 bg-slate-100 rounded w-32" />
      </div>
    );
  }

  if (!seatMap || !event) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit"
        >
          <ChevronLeft size={20} />
          <span className="font-medium">Quay lại sự kiện</span>
        </button>
        
        <div className="text-left md:text-right">
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-slate-500 text-sm">{event.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Seat Map Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="space-y-12">
            {/* Screen representation */}
            <div className="relative flex justify-center">
              <div className="w-3/4 h-2 bg-slate-200 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.05)]" />
              <div className="absolute top-4 text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Sân khấu / Màn hình</div>
            </div>

            {/* Grid Container */}
            <div className="overflow-x-auto pb-6">
              <div 
                className="grid gap-3 mx-auto" 
                style={{ 
                  gridTemplateColumns: `repeat(${seatMap.totalColumns}, minmax(0, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {seatMap.seats.sort((a, b) => (a.row - b.row) || (a.column - b.column)).map((seat) => {
                  const isSelected = selectedSeat?.id === seat.id;
                  const isAvailable = seat.status === 'AVAILABLE';
                  
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!isAvailable}
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group
                        ${isAvailable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed opacity-50'}
                        ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
                          isAvailable ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:border-indigo-400' : 
                          'bg-slate-100 text-slate-400'}
                      `}
                      title={`${seat.label} - ${seat.price.toLocaleString('vi-VN')}đ`}
                    >
                      <Armchair size={18} className={isSelected ? 'animate-bounce' : ''} />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {seat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Armchair size={14} />
                </div>
                <span className="text-sm font-medium text-slate-600">Còn trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Armchair size={14} />
                </div>
                <span className="text-sm font-medium text-slate-600">Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <Armchair size={14} />
                </div>
                <span className="text-sm font-medium text-slate-600">Đã bán</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg">Thông tin đặt vé</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Ghế đã chọn:</span>
                <span className="font-bold text-slate-900">
                  {selectedSeat ? selectedSeat.label : 'Chưa chọn'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Giá vé:</span>
                <span className="font-bold text-indigo-600 text-xl">
                  {selectedSeat ? `${selectedSeat.price.toLocaleString('vi-VN')}đ` : '0đ'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                <p>Ghế của bạn sẽ được giữ trong 10 phút sau khi nhấn đặt vé.</p>
              </div>
              
              <button
                onClick={handleBooking}
                disabled={!selectedSeat || isBooking}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                {isBooking ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Thanh toán ngay
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 flex justify-center gap-4 opacity-30 grayscale">
              <img src="https://vnpay.vn/wp-content/uploads/2020/07/Logo-VNPAYQR-update.png" alt="VNPay" className="h-6 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
