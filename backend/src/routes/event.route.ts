import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);

// Protected routes
router.post('/', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), EventController.create);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), EventController.update);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), EventController.delete);

router.patch('/:id/publish', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), EventController.publish);
router.patch('/:id/cancel', authenticateToken, authorizeRoles(UserRole.ORGANIZER, UserRole.ADMIN), EventController.cancel);

export default router;
