import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateMiddleware';
import { registerSchema, loginSchema } from '../schemas/validationSchemas';
import { authenticateToken } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getMe);

export default router;
