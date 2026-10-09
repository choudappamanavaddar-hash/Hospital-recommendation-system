import { Router } from 'express';
import * as requirementController from '../controllers/requirementController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { requirementSchema } from '../schemas/validationSchemas';

const router = Router();

router.use(authenticateToken);

router.post('/', validateRequest(requirementSchema), requirementController.createRequirement);
router.get('/:id', requirementController.getRequirement);

export default router;
