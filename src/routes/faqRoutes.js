import { Router } from 'express';
import { askFaqQuestionEmailService } from '../services/askFaqQuestionEmailService.js';

const router = Router();

// Public route - submit question (email only)
router.post('/questions', async (req, res) => {
  try {
    const { name, email, question } = req.body;
    
    // Validate input
    if (!name || !email || !question) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and question are required'
      });
    }
    
    // Send email using the dedicated FAQ email service
    await askFaqQuestionEmailService.sendQuestionNotification({ name, email, question });
    
    res.json({
      success: true,
      message: 'Question submitted successfully! I\'ll get back to you within 24 hours.'
    });
  } catch (error) {
    console.error('FAQ question submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit question. Please try again.'
    });
  }
});

export default router;