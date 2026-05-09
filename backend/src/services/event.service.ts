import { AppDataSource } from '../config/database';
import { Event, EventStatus } from '../entities/Event';
import { Like } from 'typeorm';

const eventRepository = AppDataSource.getRepository(Event);

export class EventService {
  static async getAll(filters: { status?: EventStatus; categoryId?: string; search?: string }) {
    const { status, categoryId, search } = filters;
    const query: any = {};

    if (status) query.status = status;
    if (categoryId) query.categoryId = categoryId;
    if (search) query.title = Like(`%${search}%`);

    return await eventRepository.find({
      where: query,
      relations: ['category', 'organizer'],
      order: { startDate: 'ASC' },
    });
  }

  static async getById(id: string) {
    const event = await eventRepository.findOne({
      where: { id },
      relations: ['category', 'organizer', 'seatMap'],
    });
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  }

  static async create(data: any, organizerId: string) {
    const event = eventRepository.create({
      ...data,
      organizerId,
      status: EventStatus.DRAFT,
    });
    return await eventRepository.save(event);
  }

  static async update(id: string, data: any) {
    const event = await this.getById(id);
    eventRepository.merge(event, data);
    return await eventRepository.save(event);
  }

  static async delete(id: string) {
    const event = await this.getById(id);
    return await eventRepository.remove(event);
  }

  static async updateStatus(id: string, status: EventStatus) {
    const event = await this.getById(id);
    event.status = status;
    return await eventRepository.save(event);
  }
}
