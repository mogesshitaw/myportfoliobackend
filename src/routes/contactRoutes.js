import { Router } from 'express';
import { 
  sendContactMessage,
  getAllContactMessages,
  getContactMessageById,
  toggleMessageReadStatus,
  deleteContactMessage,
  getContactStats,
  replyToContactMessage  // Add this
} from '../controllers/contactController.js';
import { authenticate, isAdmin } from '../middleware/auth.ts';

const router = Router();

// Public route - anyone can send a message
router.post('/', sendContactMessage);

// Admin only routes
router.use(authenticate, isAdmin);

router.get('/', getAllContactMessages);
router.get('/stats', getContactStats);
router.get('/:id', getContactMessageById);
router.patch('/:id/read', toggleMessageReadStatus);
router.delete('/:id', deleteContactMessage);
router.post('/reply', replyToContactMessage);  // Add this

export default router;