import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Category } from '../entities/Category';
import { Event, EventStatus } from '../entities/Event';
import { SeatMap } from '../entities/SeatMap';
import { Seat, SeatStatus } from '../entities/Seat';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Payment, PaymentStatus } from '../entities/Payment';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    // Truncate tables in correct order
    const entities = ['qr_codes', 'payments', 'tickets', 'seats', 'seat_maps', 'events', 'categories', 'users'];
    for (const entity of entities) {
      await AppDataSource.query(`DELETE FROM ${entity}`);
    }
    console.log('Cleared existing data.');

    // 1. Seed Categories
    const categoryRepo = AppDataSource.getRepository(Category);
    const catConcert = await categoryRepo.save({ name: 'Concert', description: 'Sự kiện âm nhạc' });
    const catSeminar = await categoryRepo.save({ name: 'Hội thảo', description: 'Sự kiện hội thảo, hội nghị' });
    const catWorkshop = await categoryRepo.save({ name: 'Workshop', description: 'Sự kiện workshop thực hành' });
    console.log('Seeded Categories.');

    // 2. Seed Users
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const admin = await userRepo.save({
      email: 'admin@gmail.com',
      password: hashedPassword,
      fullName: 'Admin',
      role: UserRole.ADMIN,
    });
    
    const organizer = await userRepo.save({
      email: 'organizer@gmail.com',
      password: hashedPassword,
      fullName: 'Organizer',
      role: UserRole.ORGANIZER,
    });
    
    const customer = await userRepo.save({
      email: 'customer@gmail.com',
      password: hashedPassword,
      fullName: 'Customer',
      role: UserRole.CUSTOMER,
    });
    
    const staff = await userRepo.save({
      email: 'staff@gmail.com',
      password: hashedPassword,
      fullName: 'Gate Staff',
      role: UserRole.GATE_STAFF,
    });
    console.log('Seeded Users.');

    // 3. Seed Events
    const eventRepo = AppDataSource.getRepository(Event);
    const eventsData = [
      {
        title: 'Đêm nhạc Việt 2025',
        description: 'Đêm nhạc hội tụ các ngôi sao hàng đầu Việt Nam.',
        startDate: new Date('2025-06-15T19:00:00'),
        endDate: new Date('2025-06-15T22:00:00'),
        location: 'Nhà hát TP.HCM',
        status: EventStatus.PUBLISHED,
        categoryId: catConcert.id,
        organizerId: organizer.id,
        rows: 10,
        cols: 10,
        price: 500000
      },
      {
        title: 'Hội thảo AI & Công nghệ',
        description: 'Tìm hiểu xu hướng AI mới nhất năm 2025.',
        startDate: new Date('2025-07-01T08:00:00'),
        endDate: new Date('2025-07-01T17:00:00'),
        location: 'GEM Center',
        status: EventStatus.PUBLISHED,
        categoryId: catSeminar.id,
        organizerId: organizer.id,
        rows: 8,
        cols: 8,
        price: 300000
      },
      {
        title: 'Workshop Thiết kế UI/UX',
        description: 'Thực hành thiết kế giao diện ứng dụng di động.',
        startDate: new Date('2025-07-20T14:00:00'),
        endDate: new Date('2025-07-20T17:00:00'),
        location: 'Toong Coworking',
        status: EventStatus.PUBLISHED,
        categoryId: catWorkshop.id,
        organizerId: organizer.id,
        rows: 5,
        cols: 6,
        price: 200000
      }
    ];

    const seatMapRepo = AppDataSource.getRepository(SeatMap);
    const seatRepo = AppDataSource.getRepository(Seat);
    const ticketRepo = AppDataSource.getRepository(Ticket);
    const paymentRepo = AppDataSource.getRepository(Payment);

    for (const data of eventsData) {
      const { rows, cols, price, ...eventFields } = data;
      const event = await eventRepo.save(eventFields);

      const seatMap = await seatMapRepo.save({
        eventId: event.id,
        totalRows: rows,
        totalColumns: cols,
      });

      const seats: Seat[] = [];
      for (let r = 1; r <= rows; r++) {
        const rowLabel = String.fromCharCode(64 + r);
        for (let c = 1; c <= cols; c++) {
          const seat = seatRepo.create({
            seatMapId: seatMap.id,
            row: r,
            column: c,
            label: `${rowLabel}${c}`,
            price: price,
            status: SeatStatus.AVAILABLE,
          });
          seats.push(seat);
        }
      }
      const savedSeats = await seatRepo.save(seats);
      console.log(`Seeded event: ${event.title} with ${savedSeats.length} seats.`);

      // 4. Seed Tickets and Payments for Dashboard data
      // Sell about 30% of seats randomly
      const ticketsToSell = Math.floor(savedSeats.length * 0.4);
      const shuffledSeats = savedSeats.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < ticketsToSell; i++) {
        const seat = shuffledSeats[i];
        
        // Mark seat as SOLD
        await seatRepo.update(seat.id, { status: SeatStatus.SOLD });

        // Create Ticket
        const ticket = await ticketRepo.save({
          eventId: event.id,
          seatId: seat.id,
          userId: customer.id,
          status: Math.random() > 0.2 ? TicketStatus.CONFIRMED : TicketStatus.CANCELLED,
        });

        if (ticket.status === TicketStatus.CONFIRMED) {
          // Create Payment spread over the last 30 days
          const randomDaysAgo = Math.floor(Math.random() * 30);
          const paymentDate = new Date();
          paymentDate.setDate(paymentDate.getDate() - randomDaysAgo);

          await paymentRepo.save({
            ticketId: ticket.id,
            userId: customer.id,
            amount: seat.price,
            status: PaymentStatus.SUCCESS,
            transactionId: `TXN${Math.random().toString(36).substring(7).toUpperCase()}`,
            createdAt: paymentDate,
          });
        }
      }
      console.log(`Generated ${ticketsToSell} mock tickets for ${event.title}`);
    }

    console.log('Seeding completed successfully with Revenue data!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
