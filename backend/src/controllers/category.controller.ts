import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CategoryService } from '../services/category.service';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export class CategoryController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.status(200).json({
        success: true,
        data: categories,
        message: 'Categories fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: category,
        message: 'Category fetched successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = categorySchema.parse(req.body);
      const category = await CategoryService.create(validatedData);
      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = categorySchema.parse(req.body);
      const category = await CategoryService.update(req.params.id as string, validatedData);
      res.status(200).json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.delete(req.params.id as string);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
