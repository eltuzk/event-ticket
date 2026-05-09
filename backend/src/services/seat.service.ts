import { AppDataSource } from '../config/database';
import { Seat, SeatStatus } from '../entities/Seat';

const seatRepository = AppDataSource.getRepository(Seat);

export class SeatService {
  static async getById(id: string) {
    const seat = await seatRepository.findOneBy({ id });
    if (!seat) {
      throw new Error('Seat not found');
    }
    return seat;
  }

  static async getBySeatMap(seatMapId: string, availableOnly: boolean = false) {
    const where: any = { seatMapId };
    if (availableOnly) {
      where.status = SeatStatus.AVAILABLE;
    }
    return await seatRepository.find({
      where,
      order: { label: 'ASC' },
    });
  }

  static async updatePrice(id: string, price: number) {
    const seat = await this.getById(id);
    seat.price = price;
    return await seatRepository.save(seat);
  }

  static async updateStatus(id: string, status: SeatStatus) {
    const seat = await this.getById(id);
    seat.status = status;
    return await seatRepository.save(seat);
  }
}
