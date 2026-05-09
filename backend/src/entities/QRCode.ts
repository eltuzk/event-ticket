import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Ticket } from './Ticket';

@Entity('qr_codes')
export class QRCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Ticket, (ticket) => ticket.qrCode)
  @JoinColumn({ name: 'ticketId' })
  ticket!: Ticket;

  @Column({ unique: true })
  ticketId!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ default: false })
  isScanned!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  scannedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
