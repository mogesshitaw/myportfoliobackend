import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationCount
} from '../controllers/notificationController.ts';
import { authenticate } from '../middleware/auth.ts';


const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/count', getNotificationCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/all', deleteAllNotifications);
router.delete('/:id', deleteNotification);



export default router;