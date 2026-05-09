import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EventService } from '../services/event.service';
import { EventStatus } from '../entities/Event';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string(),
  categoryId: z.string().uuid(),
});

export class EventController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as EventStatus,
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
      };
      const events = await EventService.getAll(filters);
      res.status(200).json({
        success: true,
        data: events,
        message: 'Events fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.getById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: event,
        message: 'Event fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: any, res: Response, next: NextFunction) {
    try {
      const validatedData = eventSchema.parse(req.body);
      const event = await EventService.create(validatedData, req.user.id);
      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = eventSchema.partial().parse(req.body);
      const event = await EventService.update(req.params.id as string, validatedData);
      res.status(200).json({
        success: true,
        data: event,
        message: 'Event updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await EventService.delete(req.params.id as string);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.updateStatus(req.params.id as string, EventStatus.PUBLISHED);
      res.status(200).json({
        success: true,
        data: event,
        message: 'Event published successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await EventService.updateStatus(req.params.id as string, EventStatus.CANCELLED);
      res.status(200).json({
        success: true,
        data: event,
        message: 'Event cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
