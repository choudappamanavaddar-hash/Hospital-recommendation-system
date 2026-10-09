import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { appointmentSchema } from '../schemas/validationSchemas';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(appointmentSchema), appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/:id/cancel', appointmentController.cancelAppointment);
router.post('/:id/check-in', appointmentController.checkInAppointment);

export default router;
