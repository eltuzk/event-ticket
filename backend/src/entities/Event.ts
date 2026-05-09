import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { SeatMap } from './SeatMap';
import { Ticket } from './Ticket';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  location!: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status!: EventStatus;

  @ManyToOne(() => User, (user) => user.organizedEvents)
  @JoinColumn({ name: 'organizerId' })
  organizer!: User;

  @Column()
  organizerId!: string;

  @ManyToOne(() => Category, (category) => category.events)
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column()
  categoryId!: string;

  @OneToOne(() => SeatMap, (seatMap) => seatMap.event, { cascade: true })
  seatMap!: SeatMap;

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets!: Ticket[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
