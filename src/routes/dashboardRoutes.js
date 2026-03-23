import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Dashboard stats - requires authentication
router.get('/stats',authenticate, getDashboardStats);

export default router;