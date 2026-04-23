import { Router } from 'express';
import { adminDashboardController, agentDashboardController } from '../controllers/dashboardController';
import { authorize } from '../middleware/auth';

const router = Router();

router.get('/admin', authorize('ADMIN'), adminDashboardController);
router.get('/agent', authorize('FIELD_AGENT'), agentDashboardController);

export default router;
