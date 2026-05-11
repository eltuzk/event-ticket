import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/my', TicketController.getMyTickets);
router.get('/:id', TicketController.getById);
router.post('/', TicketController.create);
router.patch('/:id/cancel', TicketController.cancel);

export default router;
