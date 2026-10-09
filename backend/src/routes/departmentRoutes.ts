import { Router } from 'express';
import * as departmentController from '../controllers/departmentController';

const router = Router();

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

export default router;
