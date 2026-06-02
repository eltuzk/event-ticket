import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Event } from '../entities/Event';
import { User } from '../entities/User';
import { Between } from 'typeorm';

const paymentRepository = AppDataSource.getRepository(Payment);
const ticketRepository = AppDataSource.getRepository(Ticket);
const eventRepository = AppDataSource.getRepository(Event);
const userRepository = AppDataSource.getRepository(User);

export class ReportService {
  static async getRevenueByEvent(eventId: string) {
    // 1. Total revenue from SUCCESS payments
    const payments = await paymentRepository.find({
      where: {
        ticket: { eventId },
        status: PaymentStatus.SUCCESS,
      },
      relations: ['ticket'],
      order: { createdAt: 'ASC' },
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

    // 4. Daily revenue Map
    const revenueByDateMap: { [key: string]: number } = {};
    payments.forEach((payment) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      revenueByDateMap[dateKey] = (revenueByDateMap[dateKey] || 0) + Number(payment.amount);
    });

    const revenueByDate = Object.keys(revenueByDateMap).map((date) => ({
      date,
      amount: revenueByDateMap[date],
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      eventId,
      eventTitle: event?.title || '',
      totalRevenue,
      ticketsSold: totalSold,
      ticketsScanned: totalUsed,
      revenueByDate,
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
      relations: ['ticket'],
      order: { createdAt: 'ASC' },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 2. Tickets sold in range
    const ticketsSold = await ticketRepository.count({
      where: [
        { 
          status: TicketStatus.CONFIRMED,
          createdAt: Between(start, end)
        },
        { 
          status: TicketStatus.USED,
          createdAt: Between(start, end)
        },
      ],
    });

    // 3. Tickets scanned in range
    const ticketsScanned = await ticketRepository.count({
      where: { 
        status: TicketStatus.USED,
        createdAt: Between(start, end)
      },
    });

    const revenueByDateMap: { [key: string]: number } = {};

    payments.forEach((payment) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      revenueByDateMap[dateKey] = (revenueByDateMap[dateKey] || 0) + Number(payment.amount);
    });

    const revenueByDate = Object.keys(revenueByDateMap).map((date) => ({
      date,
      amount: revenueByDateMap[date],
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      ticketsSold,
      ticketsScanned,
      revenueByDate,
    };
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
    const totalUsers = await userRepository.count();

    // 3. Top 5 events by revenue
    // Using QueryBuilder for complex aggregation
    const topEventsRaw = await AppDataSource.getRepository(Payment)
      .createQueryBuilder('payment')
      .innerJoin('payment.ticket', 'ticket')
      .innerJoin('ticket.event', 'event')
      .select('event.id', 'id')
      .addSelect('event.title', 'title')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(ticket.id)', 'ticketsSold')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .groupBy('event.id')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany();

    const topEvents = topEventsRaw.map(e => ({
      id: e.id,
      title: e.title,
      revenue: Number(e.revenue),
      ticketsSold: Number(e.ticketsSold),
    }));

    // 4. Daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await paymentRepository.find({
      where: {
        status: PaymentStatus.SUCCESS,
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
      order: { createdAt: 'ASC' },
    });

    const revenueByDateMap: { [key: string]: number } = {};

    recentPayments.forEach((payment) => {
      const dateKey = payment.createdAt.toISOString().split('T')[0];
      revenueByDateMap[dateKey] = (revenueByDateMap[dateKey] || 0) + Number(payment.amount);
    });

    const revenueByDate = Object.keys(revenueByDateMap).map((date) => ({
      date,
      amount: revenueByDateMap[date],
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Calculate growth percentage compared to the previous 30-day period
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const allRecentPayments = await paymentRepository.find({
      where: {
        status: PaymentStatus.SUCCESS,
        createdAt: Between(sixtyDaysAgo, new Date()),
      },
    });

    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;

    allRecentPayments.forEach((payment) => {
      if (payment.createdAt >= thirtyDaysAgo) {
        currentPeriodRevenue += Number(payment.amount);
      } else {
        previousPeriodRevenue += Number(payment.amount);
      }
    });

    let revenueGrowthPercentage = 0;
    if (previousPeriodRevenue > 0) {
      revenueGrowthPercentage = Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100);
    } else if (currentPeriodRevenue > 0) {
      revenueGrowthPercentage = 100;
    }

    return {
      totalRevenue,
      totalEvents,
      totalTicketsSold,
      totalUsers,
      revenueByDate,
      topEvents,
      revenueGrowthPercentage,
    };
  }
}
