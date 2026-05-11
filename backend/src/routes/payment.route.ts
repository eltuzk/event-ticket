import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Route for VNPay return (No JWT, called by browser redirect)
router.get('/vnpay-return', PaymentController.vnpayReturn);

// Protected routes
router.use(authenticateToken);
router.get('/my', PaymentController.getMyPayments);
router.post('/create-payment-url', PaymentController.createPaymentUrl);

export default router;
