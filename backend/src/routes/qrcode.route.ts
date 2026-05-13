import { Router } from 'express';
import { QRCodeController } from '../controllers/qrcode.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authenticateToken);

// Customer can generate QR code for their own ticket
router.post('/generate', authorizeRoles(UserRole.CUSTOMER), QRCodeController.generate);

// Gate staff and Admin can verify QR codes
router.post('/verify', authorizeRoles(UserRole.GATE_STAFF, UserRole.ADMIN), QRCodeController.verify);

router.get('/sync', authorizeRoles(UserRole.GATE_STAFF, UserRole.ADMIN), QRCodeController.syncDown);
router.post('/sync', authorizeRoles(UserRole.GATE_STAFF, UserRole.ADMIN), QRCodeController.syncUp);

export default router;
