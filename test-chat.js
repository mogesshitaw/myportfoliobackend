// backend/test-gemini.js
import { chatService } from './src/services/chatService.js';
import 'dotenv/config';

async function testGemini() {
    console.log('🧪 Testing Gemini Chat Service...\n');
    
    const questions = [
        "What skills does Moges have?",
        "Tell me about your projects",
        "How can I contact him?",
        "Is he available for hire?"
    ];
    
    for (const question of questions) {
        console.log(`👤 User: ${question}`);
        const response = await chatService.getAIResponse(question);
        console.log(`🤖 Assistant: ${response.message}\n`);
        console.log('─'.repeat(50));
        console.log('');
    }
}

testGemini();