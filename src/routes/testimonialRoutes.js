import { Router } from 'express';
import { 
  getAllTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  approveTestimonial,
  rejectTestimonial,
  toggleFeatured,
  deleteTestimonial
} from '../controllers/testimonialController.js';
import { authenticate, isAdmin, authorize } from '../middleware/auth.ts';

const router = Router();

// Public routes (no authentication needed)
router.get('/', getActiveTestimonials);           // Only approved testimonials
router.get('/:id', getTestimonialById);
router.post('/', createTestimonial);               // Public submission

// Admin only routes
router.use(authenticate); // All routes below require authentication

// Option 1: Using isAdmin middleware directly
router.get('/admin/all', isAdmin, getAllTestimonials);

// Option 2: Using authorize middleware with specific roles
router.put('/:id', authorize('admin'), updateTestimonial);
router.patch('/:id/approve', authorize('admin'), approveTestimonial);
router.patch('/:id/reject', authorize('admin'), rejectTestimonial);
router.patch('/:id/feature', authorize('admin'), toggleFeatured);
router.delete('/:id', authorize('admin'), deleteTestimonial);

export default router;