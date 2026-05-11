import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async getByEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getRevenueByEvent(req.params.eventId as string);
      res.status(200).json({
        success: true,
        data: report,
        message: 'Event revenue report fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByDateRange(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required');
      }
      const report = await ReportService.getRevenueByDateRange(
        startDate as string,
        endDate as string
      );
      res.status(200).json({
        success: true,
        data: report,
        message: 'Daily revenue report fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOverall(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.getOverallRevenue();
      res.status(200).json({
        success: true,
        data: report,
        message: 'Overall revenue report fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
