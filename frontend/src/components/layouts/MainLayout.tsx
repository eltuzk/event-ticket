import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../types';
import type { UserRoleType } from '../../types';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  LogOut, 
  Ticket,
  Menu,
  type LucideIcon
} from 'lucide-react';

interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRoleType[];
}

const MainLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const isAdminOrOrganizer = user?.role === UserRole.ADMIN || user?.role === UserRole.ORGANIZER;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Sự kiện', path: '/', icon: Calendar },
    ...(isAuthenticated && user?.role === UserRole.CUSTOMER ? [
      { label: 'Vé của tôi', path: '/my-tickets', icon: Ticket },
    ] : []),
  ];

  const adminNavItems: AdminNavItem[] = [
    { label: 'Tổng quan', path: '/admin/dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { label: 'Quản lý Sự kiện', path: '/admin/events', icon: Calendar, roles: [UserRole.ADMIN, UserRole.ORGANIZER] },
    { label: 'Báo cáo', path: '/admin/reports', icon: FileText, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {isAdminOrOrganizer && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            EventTicket
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for Admin/Organizer */}
        {isAdminOrOrganizer && (
          <aside 
            className={`
              fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
            `}
          >
            <div className="p-4 flex flex-col h-full">
              <div className="space-y-1">
                {adminNavItems.filter(item => user?.role && item.roles.includes(user.role)).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 EventTicket. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-sm text-slate-500 hover:text-slate-900">Privacy Policy</Link>
            <Link to="#" className="text-sm text-slate-500 hover:text-slate-900">Terms of Service</Link>
            <Link to="#" className="text-sm text-slate-500 hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
