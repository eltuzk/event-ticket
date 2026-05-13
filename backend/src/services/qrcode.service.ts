import QRCodeLib from 'qrcode';
import { In } from 'typeorm';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { QRCode } from '../entities/QRCode';
import { Ticket, TicketStatus } from '../entities/Ticket';

const qrcodeRepository = AppDataSource.getRepository(QRCode);
const ticketRepository = AppDataSource.getRepository(Ticket);

export class QRCodeService {
  static async generate(ticketId: string, userId: string) {
    // 1. Check ticket status
    const ticket = await ticketRepository.findOne({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new Error('Ticket not found or does not belong to you');
    }

    if (ticket.status !== TicketStatus.CONFIRMED) {
      throw new Error('Only confirmed tickets can generate a QR code');
    }

    // 2. Check if QRCode already exists
    let qrRecord = await qrcodeRepository.findOneBy({ ticketId });
    
    if (!qrRecord) {
      // 3. Create unique code
      const code = crypto.randomUUID();
      
      // 4. Save record
      qrRecord = qrcodeRepository.create({
        ticketId,
        code,
        isScanned: false,
      });
      await qrcodeRepository.save(qrRecord);
    }

    // 5. Generate QR image base64
    const qrImageBase64 = await QRCodeLib.toDataURL(qrRecord.code);

    return {
      qrCode: qrRecord,
      qrImage: qrImageBase64,
    };
  }

  static async verify(code: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Find QRCode
      const qrRecord = await transactionalEntityManager.findOne(QRCode, {
        where: { code },
        relations: ['ticket', 'ticket.event', 'ticket.user'],
      });

      if (!qrRecord) {
        throw new Error('Invalid QR Code');
      }

      // 2. Check conditions
      if (qrRecord.isScanned) {
        throw new Error('QR Code has already been scanned');
      }

      if (qrRecord.ticket.status !== TicketStatus.CONFIRMED) {
        throw new Error('Ticket is not in a valid status for entry');
      }

      // 3. Update status
      qrRecord.isScanned = true;
      qrRecord.scannedAt = new Date();
      qrRecord.ticket.status = TicketStatus.USED;

      await transactionalEntityManager.save(qrRecord);
      await transactionalEntityManager.save(qrRecord.ticket);

      return qrRecord.ticket;
    });
  }

  static async getAllForSync() {
    return await qrcodeRepository.find({
      relations: ['ticket'],
      where: {
        ticket: {
          status: In([TicketStatus.CONFIRMED, TicketStatus.USED])
        }
      }
    });
  }

  static async syncScans(scans: { code: string, scannedAt?: string }[]) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      let syncedCount = 0;
      for (const scan of scans) {
        const qrRecord = await transactionalEntityManager.findOne(QRCode, {
          where: { code: scan.code },
          relations: ['ticket'],
        });
        
        if (qrRecord && !qrRecord.isScanned) {
          qrRecord.isScanned = true;
          qrRecord.scannedAt = scan.scannedAt ? new Date(scan.scannedAt) : new Date();
          qrRecord.ticket.status = TicketStatus.USED;
          
          await transactionalEntityManager.save(qrRecord);
          await transactionalEntityManager.save(qrRecord.ticket);
          syncedCount++;
        }
      }
      return { syncedCount };
    });
  }
}
