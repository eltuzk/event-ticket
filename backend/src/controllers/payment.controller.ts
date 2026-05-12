import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service';

const createPaymentUrlSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  amount: z.number().positive(),
});

export class PaymentController {
  static async createPaymentUrl(req: any, res: Response, next: NextFunction) {
    try {
      const validatedData = createPaymentUrlSchema.parse(req.body);
      const ipAddr = 
        req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress || 
        req.connection.socket.remoteAddress || '127.0.0.1';

      const paymentUrl = await PaymentService.createVNPayUrl(
        validatedData.ticketIds,
        req.user.id,
        validatedData.amount,
        ipAddr as string
      );

      res.status(200).json({
        success: true,
        data: { paymentUrl },
        message: 'Payment URL created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async vnpayReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyVNPayReturn(req.query);
      
      // Redirect to frontend with status
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const status = result.success ? 'success' : 'failed';
      res.redirect(`${frontendUrl}/payment/return?status=${status}&paymentId=${result.paymentId || ''}`);
    } catch (error) {
      next(error);
    }
  }

  static async getMyPayments(req: any, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.getByUser(req.user.id);
      res.status(200).json({
        success: true,
        data: payments,
        message: 'Your payments fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
