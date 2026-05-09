import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Event } from './Event';
import { Seat } from './Seat';

@Entity('seat_maps')
export class SeatMap {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Event, (event) => event.seatMap)
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column({ unique: true })
  eventId!: string;

  @Column()
  totalRows!: number;

  @Column()
  totalColumns!: number;

  @OneToMany(() => Seat, (seat) => seat.seatMap, { cascade: true })
  seats!: Seat[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
