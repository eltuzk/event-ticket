export const UserRole = {
  ADMIN: 'ADMIN',
  ORGANIZER: 'ORGANIZER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleType;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type EventStatusType = (typeof EventStatus)[keyof typeof EventStatus];

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: EventStatusType;
  category: Category;
  categoryId: string;
  organizerId: string;
  imageUrl?: string;
}

export interface Seat {
  id: string;
  label: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
  row: number;
  column: number;
}

export interface SeatMap {
  id: string;
  eventId: string;
  totalRows: number;
  totalColumns: number;
  seats: Seat[];
}

export interface Ticket {
  id: string;
  seatId: string;
  eventId: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED';
  event?: Event;
  seat?: Seat;
}

export interface Payment {
  id: string;
  ticketId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  vnpayTxnRef?: string;
}

export interface QRCode {
  id: string;
  ticketId: string;
  code: string;
  isScanned: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
