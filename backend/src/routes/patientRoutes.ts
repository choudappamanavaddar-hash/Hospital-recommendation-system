import { Router } from 'express';
import * as patientController from '../controllers/patientController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { updateProfileSchema } from '../schemas/validationSchemas';

const router = Router();

router.use(authenticateToken);

router.get('/me', patientController.getProfile);
router.patch('/me', validateRequest(updateProfileSchema), patientController.updateProfile);
router.get('/me/appointments', patientController.getAppointments);
router.get('/me/visits', patientController.getVisits);

export default router;
