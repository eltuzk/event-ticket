import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/Payment';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Seat, SeatStatus } from '../entities/Seat';

const paymentRepository = AppDataSource.getRepository(Payment);

export class PaymentService {
  static async createVNPayUrl(ticketIds: string[], userId: string, amount: number, ipAddr: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Create Payment record linked to the first ticket
      const payment = paymentRepository.create({
        ticketId: ticketIds[0],
        userId,
        amount,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.MOCK,
      });
      const savedPayment = await transactionalEntityManager.save(payment);

      // 2. Build VNPay URL
      const tmnCode = process.env.VNPAY_TMN_CODE;
      const secretKey = process.env.VNPAY_HASH_SECRET;
      let vnpUrl = process.env.VNPAY_URL;
      const returnUrl = process.env.VNPAY_RETURN_URL;

      const date = new Date();
      const createDate = this.formatDate(date);
      
      // Store all ticket IDs in the OrderInfo separated by commas
      const orderInfo = `TICKETS:${ticketIds.join(',')}`;

      let vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: savedPayment.id,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // Sort params
      vnp_Params = this.sortObject(vnp_Params);
      
      const signData = this.buildQueryString(vnp_Params, true);
      const hmac = crypto.createHmac('sha512', secretKey as string);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      
      vnp_Params['vnp_SecureHash'] = signed;
      const finalQueryString = this.buildQueryString(vnp_Params, true);
      vnpUrl += '?' + finalQueryString;

      return vnpUrl;
    });
  }

  static async verifyVNPayReturn(vnp_Params: any) {
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const secretKey = process.env.VNPAY_HASH_SECRET;

    const signData = this.buildQueryString(sortedParams, true);
    const hmac = crypto.createHmac('sha512', secretKey as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentId = vnp_Params['vnp_TxnRef'];
    const responseCode = String(vnp_Params['vnp_ResponseCode']);
    const orderInfo = vnp_Params['vnp_OrderInfo'] || '';

    console.log(`[VNPay] Verification for Payment ${paymentId}:`);
    console.log(` - ResponseCode: ${responseCode}`);
    console.log(` - SignData: ${signData}`);
    console.log(` - Received Hash: ${secureHash}`);
    console.log(` - Calculated Hash: ${signed}`);

    if (secureHash && signed && secureHash.toLowerCase() === signed.toLowerCase()) {
      return await AppDataSource.transaction(async (transactionalEntityManager) => {
        const payment = await transactionalEntityManager.findOne(Payment, {
          where: { id: paymentId },
        });

        if (!payment) throw new Error('Payment not found');

        // Extract ticket IDs from OrderInfo (Express already decoded this)
        let ticketIds: string[] = [];
        if (orderInfo.startsWith('TICKETS:')) {
          ticketIds = orderInfo.replace('TICKETS:', '').split(',');
        } else {
          ticketIds = [payment.ticketId];
        }

        if (responseCode === '00' || responseCode === '0') {
          // Success
          payment.status = PaymentStatus.SUCCESS;
          console.log(`[VNPay] Confirming ${ticketIds.length} tickets for payment ${paymentId}`);
          
          for (const tid of ticketIds) {
            const ticket = await transactionalEntityManager.findOne(Ticket, {
              where: { id: tid },
              relations: ['seat'],
            });
            if (ticket) {
              ticket.status = TicketStatus.CONFIRMED;
              await transactionalEntityManager.save(ticket);
              if (ticket.seat) {
                ticket.seat.status = SeatStatus.SOLD;
                await transactionalEntityManager.save(ticket.seat);
              }
            }
          }
        } else {
          // Failed
          console.log(`[VNPay] Payment ${paymentId} failed with code ${responseCode}. Cancelling tickets.`);
          payment.status = PaymentStatus.FAILED;
          for (const tid of ticketIds) {
            const ticket = await transactionalEntityManager.findOne(Ticket, {
              where: { id: tid },
              relations: ['seat'],
            });
            if (ticket) {
              ticket.status = TicketStatus.CANCELLED;
              await transactionalEntityManager.save(ticket);
              if (ticket.seat) {
                ticket.seat.status = SeatStatus.AVAILABLE;
                await transactionalEntityManager.save(ticket.seat);
              }
            }
          }
        }

        await transactionalEntityManager.save(payment);
        return { success: responseCode === '00' || responseCode === '0', paymentId };
      });
    } else {
      console.error('[VNPay] Signature mismatch for payment', paymentId);
      return { success: false, message: 'Invalid signature' };
    }
  }

  private static sortObject(obj: any) {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  private static buildQueryString(params: any, encode: boolean = false) {
    return Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map((key) => {
        const value = encode ? encodeURIComponent(params[key].toString()).replace(/%20/g, '+') : params[key].toString();
        return `${key}=${value}`;
      })
      .join('&');
  }

  private static formatDate(date: Date) {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1).toString() +
      pad(date.getDate()).toString() +
      pad(date.getHours()).toString() +
      pad(date.getMinutes()).toString() +
      pad(date.getSeconds()).toString()
    );
  }

  static async getByUser(userId: string) {
    return await paymentRepository.find({
      where: { userId },
      relations: ['ticket'],
      order: { createdAt: 'DESC' },
    });
  }
}
