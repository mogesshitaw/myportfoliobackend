import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Dashboard stats - requires authentication
router.use(authenticate);
router.get('/stats', getDashboardStats);

export default router;