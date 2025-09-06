import { Router } from 'express';
import { revenue } from '../controllers/dashboardController.js';
const router = Router();
router.get('/revenue', revenue);
export default router;
