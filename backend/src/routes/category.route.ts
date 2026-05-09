import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../entities/User';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);

// Protected routes (Admin only)
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN), CategoryController.create);
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), CategoryController.update);
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), CategoryController.delete);

export default router;
