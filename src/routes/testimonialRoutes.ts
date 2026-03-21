import { Router } from 'express';
import { 
  getActiveTestimonials,
  getTestimonialById,
  createTestimonial,
  getAllTestimonials,
  updateTestimonial,
  approveTestimonial,
  rejectTestimonial,
  toggleFeatured,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getActiveTestimonials);
router.get('/:id', getTestimonialById);
router.post('/', createTestimonial);

// Admin only routes - requires authentication and admin role
router.use(authenticate, isAdmin);

router.get('/admin/all', getAllTestimonials);
router.put('/:id', updateTestimonial);
router.patch('/:id/approve', approveTestimonial);
router.patch('/:id/reject', rejectTestimonial);
router.patch('/:id/feature', toggleFeatured);
router.delete('/:id', deleteTestimonial);

export default router;