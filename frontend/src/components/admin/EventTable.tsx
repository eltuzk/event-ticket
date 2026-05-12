import React from 'react';
import { Edit, Trash2, Send, XCircle } from 'lucide-react';
import type { Event } from '../../types';
import { EventStatus } from '../../types';

interface EventTableProps {
  events: Event[];
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

const EventTable: React.FC<EventTableProps> = ({ 
  events, 
  onEdit, 
  onPublish, 
  onCancel, 
  onDelete 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">Nháp</span>;
      case EventStatus.PUBLISHED:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 uppercase tracking-wider">Đã đăng</span>;
      case EventStatus.CANCELLED:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">Đã hủy</span>;
      case EventStatus.COMPLETED:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">Hoàn thành</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tên sự kiện</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Danh mục</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày diễn ra</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Địa điểm</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Trạng thái</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-900 line-clamp-1">{event.title}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {event.category?.name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(event.startDate).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <span className="line-clamp-1">{event.location}</span>
              </td>
              <td className="px-6 py-4 text-center">
                {getStatusBadge(event.status)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(event.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                  </button>
                  
                  {event.status === EventStatus.DRAFT && (
                    <button 
                      onClick={() => onPublish(event.id)}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                      title="Xuất bản"
                    >
                      <Send size={18} />
                    </button>
                  )}

                  {event.status === EventStatus.PUBLISHED && (
                    <button 
                      onClick={() => onCancel(event.id)}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      title="Hủy bỏ"
                    >
                      <XCircle size={18} />
                    </button>
                  )}

                  <button 
                    onClick={() => onDelete(event.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {events.length === 0 && (
        <div className="p-12 text-center text-slate-500 font-medium">
          Chưa có sự kiện nào được tạo.
        </div>
      )}
    </div>
  );
};

export default EventTable;
