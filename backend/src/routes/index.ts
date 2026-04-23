import { Router } from 'express';
import authRoutes from './authRoutes';
import fieldRoutes from './fieldRoutes';
import dashboardRoutes from './dashboardRoutes';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use(authenticate);
router.use('/fields', fieldRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
