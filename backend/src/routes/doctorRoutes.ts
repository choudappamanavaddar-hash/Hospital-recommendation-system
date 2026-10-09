import { Router } from 'express';
import * as doctorController from '../controllers/doctorController';

const router = Router();

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getDoctorAvailability);

export default router;
