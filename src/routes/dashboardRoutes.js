import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

// Dashboard stats - requires authentication
router.get('/stats',authenticate, getDashboardStats);

export default router;