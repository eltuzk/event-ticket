import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Event } from './Event';
import { Ticket } from './Ticket';
import { Payment } from './Payment';

export enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  CUSTOMER = 'CUSTOMER',
  GATE_STAFF = 'GATE_STAFF',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  fullName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents!: Event[];

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets!: Ticket[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
