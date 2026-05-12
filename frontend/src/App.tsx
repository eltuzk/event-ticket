import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/auth.store';
import { UserRole } from './types';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import EventDetailPage from './pages/events/EventDetailPage';
import SeatSelectionPage from './pages/events/SeatSelectionPage';
import PaymentReturnPage from './pages/payment/PaymentReturnPage';
import MyTicketsPage from './pages/tickets/MyTicketsPage';
import EventManagementPage from './pages/admin/events/EventManagementPage';
import EventFormPage from './pages/admin/events/EventFormPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReportPage from './pages/admin/ReportPage';

const App: React.FC = () => {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          
          {/* Protected Routes (Login required) */}
          <Route path="/events/:id/seats" element={
            <ProtectedRoute>
              <SeatSelectionPage />
            </ProtectedRoute>
          } />

          <Route path="/payment/return" element={
            <ProtectedRoute>
              <PaymentReturnPage />
            </ProtectedRoute>
          } />

          <Route path="/my-tickets" element={
            <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
              <MyTicketsPage />
            </ProtectedRoute>
          } />

          {/* Admin/Organizer Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ORGANIZER]}>
              <EventManagementPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/events/new" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ORGANIZER]}>
              <EventFormPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/events/edit/:id" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ORGANIZER]}>
              <EventFormPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <ReportPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
