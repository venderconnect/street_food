import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listProducts, createProduct, getProduct } from '../controllers/productController.js';
const router = Router();
router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, createProduct);
export default router;
