import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SeatService } from '../services/seat.service';

const priceSchema = z.object({
  price: z.number().min(0),
});

export class SeatController {
  static async getBySeatMap(req: Request, res: Response, next: NextFunction) {
    try {
      const seats = await SeatService.getBySeatMap(req.params.seatMapId as string);
      res.status(200).json({
        success: true,
        data: seats,
        message: 'Seats fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailable(req: Request, res: Response, next: NextFunction) {
    try {
      const seats = await SeatService.getBySeatMap(req.params.seatMapId as string, true);
      res.status(200).json({
        success: true,
        data: seats,
        message: 'Available seats fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = priceSchema.parse(req.body);
      const seat = await SeatService.updatePrice(req.params.id as string, validatedData.price);
      res.status(200).json({
        success: true,
        data: seat,
        message: 'Seat price updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
