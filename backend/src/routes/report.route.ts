import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.use(authenticateToken);

// Organizers and Admins can see specific event reports
router.get('/event/:eventId', authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), ReportController.getByEvent);

// Only Admins can see date range and overall system revenue
router.get('/revenue', authorizeRoles(UserRole.ADMIN), ReportController.getByDateRange);
router.get('/overall', authorizeRoles(UserRole.ADMIN), ReportController.getOverall);

export default router;
