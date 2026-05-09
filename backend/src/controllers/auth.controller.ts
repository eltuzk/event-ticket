import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../entities/User';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string(),
  role: z.nativeEnum(UserRole).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const user = await AuthService.register(validatedData);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
        message: 'User profile fetched successfully',
      });
    } catch (error: any) {
      next(error);
    }
  }
}
