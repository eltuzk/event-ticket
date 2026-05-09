import { Router } from 'express';
import { SeatMapController } from '../controllers/seatmap.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

// Routes are mounted at /api/events/:eventId/seatmap
router.get('/', SeatMapController.getByEventId);

router.post('/', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), SeatMapController.create);
router.put('/', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), SeatMapController.update);
router.delete('/', authenticateToken, authorizeRoles(UserRole.ADMIN), SeatMapController.delete);

export default router;
