import express from 'express';
import { chatService } from '../services/chatService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();



router.post('/message', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await chatService.getAIResponse(message, conversationHistory || []);
        
        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message'
        });
    }
});


// Save chat history (authenticated users only)
router.post('/save-history', authenticate, async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.user.id;
        
        await chatService.saveChatHistory(userId, messages);
        
        res.json({
            success: true,
            message: 'Chat history saved'
        });
    } catch (error) {
        console.error('Save history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save chat history'
        });
    }
});

// Clear chat history
router.delete('/clear-history', authenticate, async (req, res) => {
    try {
        // Implement clear history logic
        res.json({
            success: true,
            message: 'Chat history cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear chat history'
        });
    }
});

export default router;