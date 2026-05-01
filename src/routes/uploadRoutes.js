import { Router } from 'express';
import upload from '../middleware/upload.js';
import { 
  uploadProjectImage, 
  uploadAvatar,
  deleteImage,
  getUploadConfig 
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Upload project image
router.post(
  '/project-image', 
  authenticate, 
  upload.single('image'), 
  uploadProjectImage
);

// Upload avatar image (for testimonials)
router.post(
  '/avatar', 
  upload.single('image'),  // No authentication required for testimonial avatar
  uploadAvatar
);

// Delete image
router.delete(
  '/:filename',
  authenticate,
  deleteImage
);
router.get('/config', getUploadConfig);  // Add this route


export default router;