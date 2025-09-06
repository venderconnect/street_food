import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import asyncHandler from '../utils/asyncHandler.js';
import { validateBody } from '../utils/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = Router();
router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));
export default router;
