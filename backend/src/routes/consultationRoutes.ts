import { Router } from 'express';
import * as consultationController from '../controllers/consultationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { consultationSchema } from '../schemas/validationSchemas';

const router = Router();

router.use(authenticateToken);

router.get('/doctor/appointments', authorizeRoles('DOCTOR', 'ADMIN'), consultationController.getDoctorAppointments);
router.get('/patient/:id/history', authorizeRoles('DOCTOR', 'ADMIN'), consultationController.getPatientHistory);
router.post('/', authorizeRoles('DOCTOR', 'ADMIN'), validateRequest(consultationSchema), consultationController.createConsultation);
router.get('/:id', consultationController.getConsultation);
router.patch('/:id', authorizeRoles('DOCTOR', 'ADMIN'), consultationController.updateConsultation);

export default router;
