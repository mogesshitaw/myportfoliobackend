// backend/src/services/chatService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

class ChatService {
    constructor() {
        this.geminiAI = null;
        this.workingModel = null;
        this.initializeGemini();
    }

    async initializeGemini() {
        if (process.env.GEMINI_API_KEY) {
            try {
                this.geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                
                const modelsToTry = [
                    'gemini-2.0-flash',
                    'gemini-2.0-flash-lite',
                    'gemini-1.5-flash',
                    'gemini-flash-latest',
                    'gemini-2.5-flash'
                ];
                
                for (const modelName of modelsToTry) {
                    try {
                        const testModel = this.geminiAI.getGenerativeModel({ model: modelName });
                        const result = await testModel.generateContent('Say "OK"');
                        await result.response.text();
                        this.workingModel = modelName;
                        console.log(`✅ Gemini AI initialized with model: ${modelName}`);
                        break;
                    } catch (error) {
                        console.log(`   Model ${modelName} not available`);
                    }
                }
                
                if (!this.workingModel) {
                    console.log('⚠️ No working Gemini model found, using fallback responses');
                    this.geminiAI = null;
                }
            } catch (error) {
                console.error('❌ Failed to initialize Gemini:', error.message);
                this.geminiAI = null;
            }
        } else {
            console.log('⚠️ No Gemini API key found, using fallback responses');
        }
    }

    // ቋንቋውን መለየት (Amharic or English)
    detectLanguage(text) {
        // የአማርኛ ፊደላትን መፈለግ (Unicode range: ሀ - ኾ)
        const amharicRegex = /[\u1200-\u137F]/;
        return amharicRegex.test(text) ? 'am' : 'en';
    }

    getPortfolioContext() {
        return {
            name: "Moges Shitaw",
            title: "Full-Stack Developer ",
            education: {
                university: "Mizan Tepi University",
                degree: "Computer Science",
                cgpa: "3.24",
                exitExam: "76%"
            },
            skills: {
                backend: ["Node.js", "Express", "Java", "PHP"],
                frontend: ["ReactJS", "HTML5", "CSS3", "TypeScript"],
                databases: ["PostgreSQL", "MySQL", "SQLite"],
                other: ["Cybersecurity", "Computer Networking", "IoT", "API Integration"]
            },
            projects: [
                {
                    name: "Banking System",
                    technologies: ["JavaFX", "JDBC", "SQL"],
                    description: "Complete banking application with secure transaction logic, account management, and complex SQL integration"
                },
                {
                    name: "IoT Smart Home Security",
                    technologies: ["NodeMCU", "Fingerprint Sensor", "Cloud"],
                    description: "IoT-based secure door lock system with biometric authentication"
                },
                {
                    name: "Telegram Automation",
                    technologies: ["Node.js", "Telegram API"],
                    description: "Message and metadata logger for automated data processing"
                }
            ],
            experience: [
                {
                    company: "POESSA",
                    role: "Intern",
                    period: "2024",
                    description: "Worked on dynamic web platforms, real-world deployment, and collaborative software development"
                }
                
            ],
            achievements: [
                "Top performer in Computer Science at Mizan Tepi University",
                "76% score on National Exit Examination",
                "CGPA of 3.24"
            ],
            philosophy: "Architecting the future through code and innovation - using technology to empower, secure, and innovate",
            contact: {
                email: "mogesshitaw7702@gmail.com",
                github: "https://github.com/mogesshitaw",
                linkedin: "https://linkedin.com/in/moges"
            }
        };
    }

    async getAIResponse(userMessage, conversationHistory = []) {
        const context = this.getPortfolioContext();
        const language = this.detectLanguage(userMessage);
        
        // በቋንቋው መሰረት የሚለየው መመሪያ
        const systemPrompt = language === 'am' ? 
            this.getAmharicPrompt(userMessage, context) : 
            this.getEnglishPrompt(userMessage, context);

        try {
            let aiResponse;
            
            if (this.geminiAI && this.workingModel) {
                const model = this.geminiAI.getGenerativeModel({ 
                    model: this.workingModel
                });
                
                const result = await model.generateContent(systemPrompt);
                aiResponse = result.response.text();
                console.log(`✅ Response generated via Gemini AI (${language === 'am' ? 'Amharic' : 'English'})`);
            } 
            else {
                aiResponse = language === 'am' ? 
                    this.getAmharicFallbackResponse(userMessage, context) : 
                    this.getEnglishFallbackResponse(userMessage, context);
            }
            
            return {
                success: true,
                message: aiResponse,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('AI Response Error:', error.message);
            return {
                success: true,
                message: language === 'am' ? 
                    this.getAmharicFallbackResponse(userMessage, context) : 
                    this.getEnglishFallbackResponse(userMessage, context),
                timestamp: new Date().toISOString()
            };
        }
    }

    getEnglishPrompt(userMessage, context) {
        return `You are Moges Shitaw's professional AI assistant. You represent a full-stack developer and cybersecurity enthusiast who believes in "Architecting the Future through Code and Innovation."

IMPORTANT INFORMATION ABOUT MOGES SHITAW:

🏆 BACKGROUND & EDUCATION:
- Graduated from Mizan Tepi University with Computer Science degree (CGPA: 3.24)
- Scored 76% on National Exit Examination
- Top performer in his class

💻 TECHNICAL SKILLS:
Backend: ${context.skills.backend.join(', ')}
Frontend: ${context.skills.frontend.join(', ')}
Databases: ${context.skills.databases.join(', ')}
Other: ${context.skills.other.join(', ')}

🚀 FLAGSHIP PROJECTS:
1. Banking System (JavaFX, JDBC): Complete banking app with secure transaction logic
2. IoT Smart Home Security (NodeMCU, Fingerprint): Biometric authentication system
3. Telegram Automation (Node.js): Message logging and data processing

💼 EXPERIENCE:
- POESSA Intern: Dynamic web platforms and collaborative development
- JQ Laser: Industrial laser engraving and automation

🎯 PHILOSOPHY: ${context.philosophy}

User Question: ${userMessage}

Please respond in English as Moges's professional AI assistant:`;
    }

    getAmharicPrompt(userMessage, context) {
        return `እንኳን ደህና መጡ! እኔ የሞገስ ሺታው አጋዥ AI ነኝ። ሞገስ ሙሉ ጊዜ ገንቢ እና የሳይበር ደህንነት አድናቂ ነው።

ስለ ሞገስ አስፈላጊ መረጃዎች:

🎓 ትምህርት:
- በሚዛን ጤፒ ዩኒቨርሲቲ በኮምፒውተር ሳይንስ ተመርቋል (CGPA: 3.24)
- በብሔራዊ መውጫ ፈተና 76% አስመዝግቧል
- በክፍሉ ከፍተኛ ውጤት አላቸው

💻 የቴክኒክ ክህሎቶች:
Backend: ${context.skills.backend.join(', ')}
Frontend: ${context.skills.frontend.join(', ')}
Databases: ${context.skills.databases.join(', ')}
ሌሎች: ${context.skills.other.join(', ')}

🚀 ዋና ዋና ፕሮጀክቶች:
1. የባንክ ሲስተም (JavaFX, JDBC): ደህንነቱ የተጠበቀ የገንዘብ ልውውጥ ሲስተም
2. IoT Smart Home Security (NodeMCU, Fingerprint): የምስጢር መለያ ደህንነት ሲስተም
3. Telegram Automation (Node.js): አውቶማቲክ መልእክት መዝጋቢ ሲስተም

💼 ልምድ:
- በPOESSA ኢንተርን: ድረ-ገጾች እና ትብብር ልማት
- በJQ Laser: ኢንዱስትሪያል ሌዘር እና አውቶሜሽን

የተጠቃሚ ጥያቄ: ${userMessage}

እባክህ በአማርኛ ለጎብኚዎች በሚገባ መልስ ስጥ። ወዳጃዊ፣ ባለሙያ እና ረዳት ሁን።`;
    }

    getEnglishFallbackResponse(userMessage, context) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.match(/(education|study|university|degree)/)) {
            return `🎓 Moges graduated from Mizan Tepi University with a degree in Computer Science (CGPA: 3.24). He also scored an impressive 76% on the National Exit Examination!`;
        }
        
        if (lowerMessage.match(/(skill|technologie|tech stack)/)) {
            return `💻 Moges is a Full-Stack Developer with expertise in:
            • Backend: ${context.skills.backend.join(', ')}
            • Frontend: ${context.skills.frontend.join(', ')}
            • Databases: ${context.skills.databases.join(', ')}`;
        }
        
        if (lowerMessage.match(/(bank|finance|financial)/)) {
            return `🏦 Moges developed a comprehensive Banking System using JavaFX and JDBC, featuring secure transaction logic and account management.`;
        }
        
        if (lowerMessage.match(/(project|portfolio)/)) {
            return `🚀 Moges's key projects include: Banking System, IoT Smart Home Security, and Telegram Automation. Each solves real-world problems!`;
        }
        
        if (lowerMessage.match(/(contact|email|reach)/)) {
            return `📧 You can reach Moges at: ${context.contact.email}`;
        }
        
        if (lowerMessage.match(/(hire|job|work)/)) {
            return `💼 Moges is open to opportunities in Full-Stack Development and Cybersecurity. Email him at ${context.contact.email}`;
        }
        
        return `🤔 I'm here to help you learn about Moges Shitaw! Ask me about his skills, projects, education, or how to contact him.`;
    }

    getAmharicFallbackResponse(userMessage, context) {
        const lowerMessage = userMessage.toLowerCase();
        
        // የአማርኛ ቁልፍ ቃላት መለየት
        if (lowerMessage.match(/(ትምህርት|ዩኒቨርሲቲ|ዲግሪ|ኮሌጅ)/)) {
            return `🎓 ሞገስ በሚዛን ጤፒ ዩኒቨርሲቲ በኮምፒውተር ሳይንስ ተመርቋል (CGPA: 3.24)። በብሔራዊ መውጫ ፈተናም 76% አስመዝግቧል!`;
        }
        
        if (lowerMessage.match(/(ክህሎት|ቴክኖሎጂ|ሙያ)/)) {
            return `💻 ሞገስ ሙሉ ጊዜ ገንቢ ሲሆን ክህሎቶቹ፦
            • Backend: ${context.skills.backend.join(', ')}
            • Frontend: ${context.skills.frontend.join(', ')}
            • ዳታቤዝ: ${context.skills.databases.join(', ')}`;
        }
        
        if (lowerMessage.match(/(ባንክ|ገንዘብ|ፋይናንስ)/)) {
            return `🏦 ሞገስ ሙሉ የባንክ ሲስተም በJavaFX እና JDBC ሠርቷል። ደህንነቱ የተጠበቀ የገንዘብ ልውውጥ እና የአካውንት አያያዝ አለው።`;
        }
        
        if (lowerMessage.match(/(ፕሮጀክት|ሥራ|ግንባታ)/)) {
            return `🚀 የሞገስ ዋና ዋና ፕሮጀክቶች፦ የባንክ ሲስተም፣ IoT Smart Home Security፣ እና Telegram Automation ናቸው።`;
        }
        
        if (lowerMessage.match(/(አድራሻ|ኢሜይል|መገናኛ)/)) {
            return `📧 ሞገስን በዚህ ኢሜይል መገናኘት ትችላላችሁ፡ ${context.contact.email}`;
        }
        
        if (lowerMessage.match(/(ሥራ|ቅጥር|ክፍያ)/)) {
            return `💼 ሞገስ በFull-Stack Development እና Cybersecurity ዘርፍ እድሎችን ይፈልጋል። በ${context.contact.email} ኢሜይል ያግኙት።`;
        }
        
        return `🤔 እንኳን ደህና መጡ! ስለ ሞገስ ሺታው ለማወቅ እገዛሃለሁ። 
        
ስለሚከተሉት ነገሮች መጠየቅ ትችላላችሁ:
• ትምህርቱ (CGPA 3.24, 76% በመውጫ ፈተና)
• የቴክኒክ ክህሎቶቹ (Node.js, React, Java, IoT)
• ፕሮጀክቶቹ (የባንክ ሲስተም፣ IoT ደህንነት)
• የሥራ ልምዱ (POESSA, JQ Laser)
• የመገናኛ መረጃ

ምን ማወቅ ትፈልጋላችሁ?`;
    }

    async saveChatHistory(userId, messages) {
        console.log(`Saving ${messages.length} messages for user ${userId}`);
        return { success: true };
    }
}

export const chatService = new ChatService();