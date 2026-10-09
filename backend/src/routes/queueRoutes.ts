import { Router } from 'express';
import * as queueController from '../controllers/queueController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/appointment/:id', queueController.getAppointmentQueue);
router.get('/current', queueController.getCurrentQueue);
router.get('/:id', queueController.getQueueById);
router.post('/call-next', authorizeRoles('DOCTOR', 'ADMIN'), queueController.callNext);

export default router;
