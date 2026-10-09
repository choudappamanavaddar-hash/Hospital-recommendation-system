import { Router } from 'express';
import * as recommendationController from '../controllers/recommendationController';

const router = Router();

router.post('/', recommendationController.createRecommendation);
router.get('/:id', recommendationController.getRecommendation);

export default router;
