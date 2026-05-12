import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Ticket, Home, ArrowRight } from 'lucide-react';

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING'>('PENDING');

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const backendStatus = searchParams.get('status');
    
    if (responseCode === '00' || backendStatus === 'success') {
      setStatus('SUCCESS');
    } else {
      setStatus('FAILED');
    }
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center">
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl space-y-8 relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 ${status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          {status === 'SUCCESS' ? (
            <>
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 ring-8 ring-green-50/50">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900">Thanh toán thành công!</h1>
                <p className="text-slate-500">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Vé của bạn đã sẵn sàng.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500 ring-8 ring-red-50/50">
                <XCircle size={48} />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900">Thanh toán thất bại</h1>
                <p className="text-slate-500">Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại sau.</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-6">
            <Link 
              to="/my-tickets"
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                status === 'SUCCESS' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Ticket size={20} />
              Xem vé của tôi
            </Link>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Home size={20} />
              Trang chủ
            </Link>
          </div>

          {status === 'FAILED' && (
            <button 
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              Thử lại thanh toán <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 text-slate-400 text-xs uppercase tracking-widest font-bold">
        Mã giao dịch: {searchParams.get('vnp_TransactionNo') || 'N/A'}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
