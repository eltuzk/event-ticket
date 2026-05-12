import { AppDataSource } from '../config/database';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Seat, SeatStatus } from '../entities/Seat';

const ticketRepository = AppDataSource.getRepository(Ticket);
const seatRepository = AppDataSource.getRepository(Seat);

export class TicketService {
  static async getById(id: string) {
    const ticket = await ticketRepository.findOne({
      where: { id },
      relations: ['seat', 'event', 'user'],
    });
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return ticket;
  }

  static async getByUser(userId: string) {
    return await ticketRepository.find({
      where: { userId },
      relations: ['seat', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  static async create(userId: string, seatIds: string[], eventId: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const tickets: Ticket[] = [];

      for (const seatId of seatIds) {
        // Check seat status with pessimistic lock to prevent concurrent booking
        const seat = await transactionalEntityManager.findOne(Seat, {
          where: { id: seatId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!seat) {
          throw new Error(`Seat with ID ${seatId} not found`);
        }

        if (seat.status !== SeatStatus.AVAILABLE) {
          throw new Error(`Ghế ${seat.label} đã có người đặt, vui lòng chọn ghế khác`);
        }

        // Create ticket
        const ticket = ticketRepository.create({
          userId,
          seatId,
          eventId,
          status: TicketStatus.PENDING,
        });

        const savedTicket = await transactionalEntityManager.save(ticket);
        tickets.push(savedTicket);

        // Update seat status
        seat.status = SeatStatus.RESERVED;
        await transactionalEntityManager.save(seat);
      }

      return tickets;
    });
  }

  static async cancel(id: string, userId: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const ticket = await transactionalEntityManager.findOne(Ticket, {
        where: { id, userId },
        relations: ['seat'],
      });

      if (!ticket) {
        throw new Error('Ticket not found or does not belong to you');
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        throw new Error('Ticket is already cancelled');
      }

      if (ticket.status === TicketStatus.CONFIRMED || ticket.status === TicketStatus.USED) {
        throw new Error('Cannot cancel a confirmed or used ticket');
      }

      // Update ticket status
      ticket.status = TicketStatus.CANCELLED;
      await transactionalEntityManager.save(ticket);

      // Update seat status back to AVAILABLE
      if (ticket.seat) {
        ticket.seat.status = SeatStatus.AVAILABLE;
        await transactionalEntityManager.save(ticket.seat);
      }

      return ticket;
    });
  }
}
