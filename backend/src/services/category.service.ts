import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryService {
  static async getAll() {
    return await categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  static async getById(id: string) {
    const category = await categoryRepository.findOneBy({ id });
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  static async create(data: { name: string; description?: string }) {
    const category = categoryRepository.create(data);
    return await categoryRepository.save(category);
  }

  static async update(id: string, data: { name: string; description?: string }) {
    const category = await this.getById(id);
    categoryRepository.merge(category, data);
    return await categoryRepository.save(category);
  }

  static async delete(id: string) {
    const category = await this.getById(id);
    return await categoryRepository.remove(category);
  }
}
