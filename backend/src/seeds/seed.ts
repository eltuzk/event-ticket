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
    const catConcert = await categoryRepo.save({ name: 'Concert', description: 'Sự kiện âm nhạc sôi động' });
    const catSeminar = await categoryRepo.save({ name: 'Hội thảo', description: 'Hội thảo công nghệ và AI' });
    const catWorkshop = await categoryRepo.save({ name: 'Workshop', description: 'Workshop nghệ thuật thực hành' });
    const catSports = await categoryRepo.save({ name: 'Thể thao', description: 'Các trận đấu thể thao đỉnh cao' });
    const catCinema = await categoryRepo.save({ name: 'Điện ảnh', description: 'Liên hoan phim và ra mắt phim' });
    const catFood = await categoryRepo.save({ name: 'Ẩm thực', description: 'Lễ hội văn hóa ẩm thực' });
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
        description: 'Đêm nhạc hội tụ các ngôi sao hàng đầu Việt Nam với hệ thống âm thanh ánh sáng hiện đại.',
        startDate: new Date('2025-06-15T19:00:00'),
        endDate: new Date('2025-06-15T22:00:00'),
        location: 'Nhà hát TP.HCM',
        status: EventStatus.PUBLISHED,
        categoryId: catConcert.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/concert.png',
        rows: 10,
        cols: 10,
        price: 500000
      },
      {
        title: 'Tech Summit 2025: AI Revolution',
        description: 'Tìm hiểu xu hướng AI mới nhất và cách áp dụng vào doanh nghiệp năm 2025.',
        startDate: new Date('2025-07-01T08:00:00'),
        endDate: new Date('2025-07-01T17:00:00'),
        location: 'GEM Center',
        status: EventStatus.PUBLISHED,
        categoryId: catSeminar.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/tech.png',
        rows: 12,
        cols: 12,
        price: 300000
      },
      {
        title: 'Workshop Vẽ Tranh Sơn Dầu',
        description: 'Thực hành kỹ thuật vẽ tranh sơn dầu cơ bản cho người mới bắt đầu.',
        startDate: new Date('2025-07-20T14:00:00'),
        endDate: new Date('2025-07-20T17:00:00'),
        location: 'Art Station Q1',
        status: EventStatus.PUBLISHED,
        categoryId: catWorkshop.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/art.png',
        rows: 6,
        cols: 6,
        price: 250000
      },
      {
        title: 'Chung Kết Cúp Bóng Đá 2025',
        description: 'Trận cầu đỉnh cao giữa hai đội bóng mạnh nhất mùa giải.',
        startDate: new Date('2025-08-10T18:30:00'),
        endDate: new Date('2025-08-10T21:30:00'),
        location: 'Sân vận động Mỹ Đình',
        status: EventStatus.PUBLISHED,
        categoryId: catSports.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/sport.png',
        rows: 20,
        cols: 25,
        price: 450000
      },
      {
        title: 'Liên Hoan Phim Quốc Tế 2025',
        description: 'Công chiếu các tác phẩm điện ảnh xuất sắc từ khắp nơi trên thế giới.',
        startDate: new Date('2025-09-05T18:00:00'),
        endDate: new Date('2025-09-12T23:00:00'),
        location: 'Trung tâm Chiếu phim Quốc gia',
        status: EventStatus.PUBLISHED,
        categoryId: catCinema.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/film.png',
        rows: 15,
        cols: 15,
        price: 150000
      },
      {
        title: 'Lễ Hội Ẩm Thực Đường Phố',
        description: 'Trải nghiệm hàng trăm món ăn đường phố hấp dẫn và đa dạng văn hóa.',
        startDate: new Date('2025-10-15T10:00:00'),
        endDate: new Date('2025-10-17T22:00:00'),
        location: 'Công viên Lê Văn Tám',
        status: EventStatus.PUBLISHED,
        categoryId: catFood.id,
        organizerId: organizer.id,
        imageUrl: 'http://localhost:3000/public/images/food.png',
        rows: 8,
        cols: 8,
        price: 50000
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
