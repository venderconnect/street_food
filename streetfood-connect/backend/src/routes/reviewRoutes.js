import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createReview } from '../controllers/reviewController.js';
const router = Router();
router.post('/', requireAuth, createReview);
export default router;
