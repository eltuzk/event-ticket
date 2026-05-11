import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Event } from '../entities/Event';
import { Between } from 'typeorm';

const paymentRepository = AppDataSource.getRepository(Payment);
const ticketRepository = AppDataSource.getRepository(Ticket);
const eventRepository = AppDataSource.getRepository(Event);

export class ReportService {
  static async getRevenueByEvent(eventId: string) {
    // 1. Total revenue from SUCCESS payments
    const payments = await paymentRepository.find({
      where: {
        ticket: { eventId },
        status: PaymentStatus.SUCCESS,
      },
      relations: ['ticket'],
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 2. Total tickets sold (Confirmed or Used)
    const totalSold = await ticketRepository.count({
      where: [
        { eventId, status: TicketStatus.CONFIRMED },
        { eventId, status: TicketStatus.USED },
      ],
    });

    // 3. Total tickets used
    const totalUsed = await ticketRepository.count({
      where: { eventId, status: TicketStatus.USED },
    });

    const event = await eventRepository.findOneBy({ id: eventId });

    return {
      eventTitle: event?.title,
      totalRevenue,
      totalSold,
      totalUsed,
    };
  }

  static async getRevenueByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const payments = await paymentRepository.find({
      where: {
        status: PaymentStatus.SUCCESS,
        createdAt: Between(start, end),
      },
      order: { createdAt: 'ASC' },
    });

    const revenueByDate: { [key: string]: number } = {};

    payments.forEach((payment) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      revenueByDate[dateKey] = (revenueByDate[dateKey] || 0) + Number(payment.amount);
    });

    return Object.keys(revenueByDate).map((date) => ({
      date,
      revenue: revenueByDate[date],
    }));
  }

  static async getOverallRevenue() {
    // 1. Total system revenue
    const successPayments = await paymentRepository.find({
      where: { status: PaymentStatus.SUCCESS },
    });
    const totalRevenue = successPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 2. Total counts
    const totalEvents = await eventRepository.count();
    const totalTicketsSold = await ticketRepository.count({
      where: [
        { status: TicketStatus.CONFIRMED },
        { status: TicketStatus.USED },
      ],
    });

    // 3. Top 5 events by revenue
    // Using QueryBuilder for complex aggregation
    const topEvents = await AppDataSource.getRepository(Payment)
      .createQueryBuilder('payment')
      .innerJoin('payment.ticket', 'ticket')
      .innerJoin('ticket.event', 'event')
      .select('event.title', 'eventTitle')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .groupBy('event.id')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalRevenue,
      totalEvents,
      totalTicketsSold,
      topEvents,
    };
  }
}
