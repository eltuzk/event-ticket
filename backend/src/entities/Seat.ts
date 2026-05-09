import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

  @OneToMany(() => Ticket, (ticket) => ticket.seat)
  tickets!: Ticket[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
