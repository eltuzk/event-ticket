import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { SeatMap } from './SeatMap';
import { Ticket } from './Ticket';

export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => SeatMap, (seatMap) => seatMap.seats)
  @JoinColumn({ name: 'seatMapId' })
  seatMap!: SeatMap;

  @Column()
  seatMapId!: string;

  @Column()
  row!: number;

  @Column()
  column!: number;

  @Column()
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  })
  status!: SeatStatus;

  @OneToOne(() => Ticket, (ticket) => ticket.seat)
  ticket?: Ticket;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
