import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { adminDepartmentSchema, adminDoctorSchema } from '../schemas/validationSchemas';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboardStats);
router.post('/departments', validateRequest(adminDepartmentSchema), adminController.createDepartment);
router.patch('/departments/:id', adminController.updateDepartment);
router.post('/doctors', validateRequest(adminDoctorSchema), adminController.createDoctor);
router.patch('/doctors/:id', adminController.updateDoctor);
router.post('/schedules', adminController.createSchedule);
router.patch('/schedules/:id', adminController.updateSchedule);
router.get('/reports', adminController.getReports);

export default router;
