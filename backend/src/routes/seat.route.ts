import { Router } from 'express';
import { SeatController } from '../controllers/seat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

// Routes mounted at /api/seatmaps/:seatMapId/seats
router.get('/', SeatController.getBySeatMap);
router.get('/available', SeatController.getAvailable);

// Patch specific seat (by seat ID)
// This will be mounted at /api/seats/:id/price
export const seatItemRouter = Router();
seatItemRouter.patch('/:id/price', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), SeatController.updatePrice);

export default router;
