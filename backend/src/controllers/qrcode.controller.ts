import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QRCodeService } from '../services/qrcode.service';

const generateSchema = z.object({
  ticketId: z.string().uuid(),
});

const verifySchema = z.object({
  code: z.string(),
});

export class QRCodeController {
  static async generate(req: any, res: Response, next: NextFunction) {
    try {
      const validatedData = generateSchema.parse(req.body);
      const result = await QRCodeService.generate(validatedData.ticketId, req.user.id);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'QR Code generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verifySchema.parse(req.body);
      const ticket = await QRCodeService.verify(validatedData.code);
      
      res.status(200).json({
        success: true,
        data: ticket,
        message: 'Ticket verified successfully. Entry granted!',
      });
    } catch (error) {
      next(error);
    }
  }
}
