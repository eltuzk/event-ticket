import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SeatMapService } from '../services/seatmap.service';

const seatMapSchema = z.object({
  totalRows: z.number().min(1).max(26), // Limited to A-Z for labels
  totalColumns: z.number().min(1),
});

export class SeatMapController {
  static async getByEventId(req: Request, res: Response, next: NextFunction) {
    try {
      const seatMap = await SeatMapService.getByEventId(req.params.eventId as string);
      res.status(200).json({
        success: true,
        data: seatMap,
        message: 'Seat map fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = seatMapSchema.parse(req.body);
      const seatMap = await SeatMapService.create(
        req.params.eventId as string,
        validatedData.totalRows,
        validatedData.totalColumns
      );
      res.status(201).json({
        success: true,
        data: seatMap,
        message: 'Seat map created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = seatMapSchema.parse(req.body);
      // We assume the eventId is used to find the map
      const seatMap = await SeatMapService.getByEventId(req.params.eventId as string);
      const updatedMap = await SeatMapService.update(
        seatMap.id,
        validatedData.totalRows,
        validatedData.totalColumns
      );
      res.status(200).json({
        success: true,
        data: updatedMap,
        message: 'Seat map updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const seatMap = await SeatMapService.getByEventId(req.params.eventId as string);
      await SeatMapService.delete(seatMap.id);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Seat map deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
