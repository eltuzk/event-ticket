import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/Payment';
import { Ticket, TicketStatus } from '../entities/Ticket';
import { Seat, SeatStatus } from '../entities/Seat';

const paymentRepository = AppDataSource.getRepository(Payment);

export class PaymentService {
  static async createVNPayUrl(ticketId: string, userId: string, amount: number, ipAddr: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      // 1. Create Payment record
      const payment = paymentRepository.create({
        ticketId,
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
      
      let vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: savedPayment.id,
        vnp_OrderInfo: `Thanh toan ve cho ve: ${ticketId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // Sort params
      vnp_Params = this.sortObject(vnp_Params);
      
      const signData = this.buildQueryString(vnp_Params);
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

    const signData = this.buildQueryString(sortedParams);
    const hmac = crypto.createHmac('sha512', secretKey as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    if (secureHash === signed) {
      return await AppDataSource.transaction(async (transactionalEntityManager) => {
        const payment = await transactionalEntityManager.findOne(Payment, {
          where: { id: paymentId },
          relations: ['ticket', 'ticket.seat'],
        });

        if (!payment) throw new Error('Payment not found');

        if (responseCode === '00') {
          // Success
          payment.status = PaymentStatus.SUCCESS;
          payment.ticket.status = TicketStatus.CONFIRMED;
          if (payment.ticket.seat) {
            payment.ticket.seat.status = SeatStatus.SOLD;
          }
        } else {
          // Failed
          payment.status = PaymentStatus.FAILED;
          payment.ticket.status = TicketStatus.CANCELLED;
          if (payment.ticket.seat) {
            payment.ticket.seat.status = SeatStatus.AVAILABLE;
          }
        }

        await transactionalEntityManager.save(payment);
        await transactionalEntityManager.save(payment.ticket);
        if (payment.ticket.seat) {
          await transactionalEntityManager.save(payment.ticket.seat);
        }

        return { success: responseCode === '00', paymentId };
      });
    } else {
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
      .map((key) => {
        const value = encode ? encodeURIComponent(params[key]).replace(/%20/g, '+') : params[key];
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
