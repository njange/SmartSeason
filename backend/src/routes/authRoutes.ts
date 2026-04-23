import { Router } from 'express';
import { loginController } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../services/authService';

const router = Router();

router.post('/login', validateBody(loginSchema), loginController);

export default router;
