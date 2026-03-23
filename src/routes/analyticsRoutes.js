import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// Analytics routes - admin only
router.use(authenticate, isAdmin);
router.get('/', getAnalytics);

export default router;