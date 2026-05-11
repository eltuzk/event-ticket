import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Seat } from './Seat';
import { Event } from './Event';
import { User } from './User';
import { QRCode } from './QRCode';
import { Payment } from './Payment';

export enum TicketStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  USED = 'USED',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Seat, (seat) => seat.ticket)
  @JoinColumn({ name: 'seatId' })
  seat!: Seat;

  @Column()
  seatId!: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column()
  eventId!: string;

  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status!: TicketStatus;

  @OneToOne(() => QRCode, (qrCode) => qrCode.ticket, { cascade: true })
  qrCode!: QRCode;

  @OneToMany(() => Payment, (payment) => payment.ticket)
  payments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
