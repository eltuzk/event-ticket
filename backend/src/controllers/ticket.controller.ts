import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TicketService } from '../services/ticket.service';

const createTicketSchema = z.object({
  seatIds: z.array(z.string().uuid()),
  eventId: z.string().uuid(),
});

export class TicketController {
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.getById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: ticket,
        message: 'Ticket fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTickets(req: any, res: Response, next: NextFunction) {
    try {
      const tickets = await TicketService.getByUser(req.user.id);
      res.status(200).json({
        success: true,
        data: tickets,
        message: 'Your tickets fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const validatedData = createTicketSchema.parse(req.body);
      const tickets = await TicketService.create(
        req.user.id,
        validatedData.seatIds,
        validatedData.eventId
      );
      res.status(201).json({
        success: true,
        data: tickets,
        message: `${tickets.length} vé đã được đặt thành công`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: any, res: Response, next: NextFunction) {
    try {
      const ticket = await TicketService.cancel(req.params.id as string, req.user.id);
      res.status(200).json({
        success: true,
        data: ticket,
        message: 'Ticket cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
