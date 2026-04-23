// backend/list-models.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('🔍 Fetching available Gemini models...\n');
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to list models (this might not work with all API keys)
        // Alternative: Use fetch directly
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY
        );
        
        const data = await response.json();
        
        if (data.models) {
            console.log('✅ Available models:');
            data.models.forEach(model => {
                console.log(`   • ${model.name} - ${model.supportedGenerationMethods?.join(', ')}`);
            });
        } else {
            console.log('⚠️ Could not fetch models, trying common names...');
        }
    } catch (error) {
        console.error('Error fetching models:', error.message);
    }
    
    // Test common model names
    console.log('\n🧪 Testing common model names:\n');
    
    const modelsToTest = [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-1.0-pro',
        'models/gemini-1.5-pro',
        'models/gemini-pro'
    ];
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "OK"');
            await result.response.text();
            console.log(`✅ Working model: ${modelName}`);
            break;
        } catch (error) {
            console.log(`❌ ${modelName} - Not working`);
        }
    }
}

listModels();