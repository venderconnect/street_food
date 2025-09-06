import { Router } from 'express';
import { supplierProfile, vendorProfile } from '../controllers/profileController.js';
const router = Router();
router.get('/supplier/:id', supplierProfile);
router.get('/vendor/:id', vendorProfile);
export default router;
