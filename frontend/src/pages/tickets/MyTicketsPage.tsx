import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';
import type { Ticket } from '../../types';
import { toast } from 'sonner';
import { QrCode, Calendar, MapPin, Armchair, Ticket as TicketIcon, X } from 'lucide-react';

const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      toast.error('Không thể tải danh sách vé.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsQrLoading(true);
    try {
      const qrData = await ticketService.getQRCode(ticketId);
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Failed to fetch QR code', error);
      toast.error('Không thể tải mã QR.');
      setSelectedTicketId(null);
    } finally {
      setIsQrLoading(false);
    }
  };

  const closeQR = () => {
    setSelectedTicketId(null);
    setQrCodeData(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vé của tôi</h1>
        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold">
          {tickets.length} vé
        </div>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-indigo-200 transition-all shadow-sm group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Status Bar (Mobile) */}
                <div className={`md:hidden h-2 w-full ${
                  ticket.status === 'PAID' ? 'bg-green-500' : 
                  ticket.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

                {/* Left Side: Ticket Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                        ticket.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {ticket.status === 'PAID' ? 'Đã thanh toán' : 
                         ticket.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {ticket.event?.title}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} />
                        <span>{ticket.event ? new Date(ticket.event.startDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{ticket.event?.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Armchair size={14} className="text-indigo-500" />
                        <span>Ghế: {ticket.seat?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action */}
                <div className="w-full md:w-48 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex items-center justify-center">
                  {ticket.status === 'PAID' ? (
                    <button 
                      onClick={() => handleShowQR(ticket.id)}
                      className="flex items-center gap-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <QrCode size={18} />
                      Xem QR
                    </button>
                  ) : ticket.status === 'PENDING' ? (
                    <button className="text-sm font-bold text-indigo-600 hover:underline">
                      Tiếp tục thanh toán
                    </button>
                  ) : (
                    <span className="text-sm text-slate-400 font-medium italic">Vé không hợp lệ</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <TicketIcon size={40} />
          </div>
          <p className="text-slate-500 font-medium">Bạn chưa có vé nào. Khám phá sự kiện ngay!</p>
          <Link to="/" className="inline-block mt-6 text-indigo-600 font-bold hover:underline">
            Quay lại Trang chủ
          </Link>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeQR} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeQR}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-10 space-y-8 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Mã QR Vé của bạn</h3>
                <p className="text-sm text-slate-500 italic">Vui lòng xuất trình mã này tại cổng vào</p>
              </div>

              <div className="aspect-square bg-slate-100 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-slate-50 shadow-inner">
                {isQrLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tạo...</span>
                  </div>
                ) : qrCodeData ? (
                  <img src={qrCodeData} alt="Ticket QR Code" className="w-full h-full p-6 bg-white" />
                ) : (
                  <p className="text-sm text-red-500">Lỗi khi tải mã QR</p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã vé</p>
                <p className="text-lg font-mono font-bold text-slate-900">{selectedTicketId.substring(0, 12).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
