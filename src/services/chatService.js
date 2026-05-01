// backend/src/services/chatService.js
import 'dotenv/config';

class ChatService {
    constructor() {
        // Gemini AI ን አላጠፋም ግን ለአሁን አናገናዘብም
        this.useAI = false; // ለጊዜው AI አጥፋ
        console.log('📝 Using bilingual fallback responses (AI temporarily disabled due to high demand)');
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
            title: "Full-Stack Developer",
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
                other: ["Computer Networking", "IoT", "API Integration", "Industrial Automation"]
            },
            projects: [
                {
                    name: "Banking System",
                    technologies: ["JavaFX", "JDBC", "SQL"],
                    description: "Complete banking application with secure transaction logic"
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
                },
                {
                    name: "E-Commerce Platform",
                    technologies: ["React", "Node.js", "MongoDB"],
                    description: "Full-featured online store with payment integration"
                }
            ],
            experience: [
                {
                    company: "POESSA",
                    role: "Intern",
                    period: "2024",
                    description: "Worked on dynamic web platforms"
                },
                {
                    company: "JQ Laser",
                    role: "Industrial Automation",
                    period: "Current",
                    description: "Working on industrial laser engraving machinery"
                }
            ],
            achievements: [
                "Top performer in Computer Science (CGPA: 3.24)",
                "76% score on National Exit Examination",
                "Successfully deployed multiple full-stack applications"
            ],
            philosophy: "Architecting the future through code and innovation",
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
        
        // ሁልጊዜ Fallback ምላሽ ተጠቀም (ፈጣን እና አስተማማኝ)
        const response = language === 'am' ? 
            this.getAmharicFallbackResponse(userMessage, context) : 
            this.getEnglishFallbackResponse(userMessage, context);
        
        return {
            success: true,
            message: response,
            timestamp: new Date().toISOString()
        };
    }

    getEnglishFallbackResponse(userMessage, context) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Education
        if (lowerMessage.match(/(education|study|university|degree|academic)/)) {
            return `🎓 Education & Academic Excellence
• B.Sc. in Computer Science from Mizan Tepi University
• CGPA: 3.24 (Top performer)
• National Exit Examination: 76% score
• Graduated with distinction in software engineering principles`;
        }
        
        // Skills
        if (lowerMessage.match(/(skill|technologie|tech stack|tools|expertise)/)) {
            return `💻 Technical Expertise
• Backend ${context.skills.backend.join(', ')} - Building robust, scalable APIs
• Frontend ${context.skills.frontend.join(', ')} - Creating responsive, intuitive interfaces
• Databases ${context.skills.databases.join(', ')} - Ensuring data integrity and performance
• Other ${context.skills.other.join(', ')} - Building innovative solutions

Currently mastering TypeScript and exploring cloud architecture!`;
        }
        
        // Banking Project
        if (lowerMessage.match(/(bank|finance|financial|transaction|money)/)) {
            return `🏦 Banking System Project
Moges developed a comprehensive banking application using JavaFX and JDBC. This production-ready system includes:
• Secure transaction processing with encryption
• Complete account management (create, update, delete)
• Complex SQL queries for financial reporting
• User authentication and authorization

This project demonstrates his readiness for roles at major financial institutions!`;
        }
        
        // IoT Project
        if (lowerMessage.match(/(iot|smart home|security system|fingerprint|biometric)/)) {
            return `🔒 IoT Smart Home Security System
Moges engineered an innovative IoT-based secure door lock featuring:
• Biometric fingerprint authentication
• NodeMCU microcontroller integration
• Cloud connectivity for remote monitoring
• Real-time access logging

This project bridges hardware and software, perfect for modern security applications!`;
        }
        
        // Projects
        if (lowerMessage.match(/(project|portfolio|work|built|created|developed)/)) {
            return `🚀 Featured Projects

1. Banking System (JavaFX, JDBC)
   - Complete financial transaction system
   - Secure account management

2. IoT Smart Home Security (NodeMCU, Fingerprint Sensor)
   - Biometric authentication
   - Cloud-connected security

3. Telegram Automation (Node.js, API)
   - Automated message logging
   - Data processing pipeline

4. E-Commerce Platform (React, Node.js, MongoDB)
   - Full-featured online store
   - Payment integration

Each project solves real-world problems with innovative code solutions!`;
        }
        
        // Experience
        if (lowerMessage.match(/(experience|work|job|intern|career)/)) {
            return `💼 Professional Experience

• POESSA (Intern) - 2024
  - Developed dynamic web platforms
  - Collaborated on real-world deployments
  - Gained production environment experience

• JQ Laser (Industrial Automation) - Current
  - Working with industrial laser engraving machinery
  - Implementing automation solutions
  - Bridging software with industrial efficiency

Always eager for new challenges in Software Support and Full-Stack Development!`;
        }
        
        // Achievements
        if (lowerMessage.match(/(achievement|award|rank|score|accomplishment)/)) {
            return ` Key Achievements
• Top performer in Computer Science department (CGPA: 3.24)
• 76% score on National Exit Examination (above average)
• Successfully deployed banking system with real transaction logic
• Built IoT security system with biometric authentication
• Created multiple production-ready full-stack applications`;
        }
        
        // Philosophy
        if (lowerMessage.match(/(philosophy|vision|believe|approach|mission)/)) {
            return ` Professional Philosophy
"Architecting the Future through Code and Innovation"

Moges believes technology is not just a tool, but a canvas for creativity and a medium for structural change. His mission is to use code to:
• Empower Ethiopian businesses
• Build innovative digital solutions
• Drive technology adoption in the local ecosystem

He's committed to building solutions that matter!`;
        }
        
        // Contact
        if (lowerMessage.match(/(contact|email|reach|linkedin|github|connect)/)) {
            return `Contact Information
• Email ${context.contact.email}
• GitHub ${context.contact.github}
• LinkedIn ${context.contact.linkedin}

Best way to reach him is via email. He typically responds within 24 hours and is open to:
• Freelance projects
• Full-time opportunities
• Technical collaborations
• Consulting work`;
        }
        
        // Hiring/Collaboration
        if (lowerMessage.match(/(hire|collaborate|work together|freelance|job|contract|position)/)) {
            return `💼 Opportunities & Collaboration

Moges is actively seeking opportunities in:
• Software Support & Development
• Full-Stack Engineering
• Industrial Automation
• FinTech Solutions

For serious inquiries, please email: ${context.contact.email}

He's particularly excited about contributing to Ethiopia's digital transformation and modernization!`;
        }
        
        // About
        if (lowerMessage.match(/(who is|about|background|tell me about|introduce)/)) {
            return `👨‍💻 About Moges Shitaw:

Moges is a passionate Full-Stack Developer who believes in "Architecting the Future through Code and Innovation."

Background:
• Graduated from Mizan Tepi University (CGPA: 3.24)
• Scored 76% on National Exit Examination
• Top performer in Computer Science

Expertise:
• Building banking systems with secure transactions
• Creating IoT security solutions with biometrics
• Developing e-commerce platforms
• Building automation tools and APIs

Mission:
Using technology to empower, innovate, and drive digital transformation in Ethiopia's economy.

He's the kind of developer who doesn't just write code - he architects solutions that matter!`;
        }
        
        // Default response
        return `🤔 How can I help you learn about Moges Shitaw?

I'm his professional AI assistant. You can ask me about:

📚 Education - CGPA 3.24, 76% exit exam, Mizan Tepi University
💻 Technical Skills - Node.js, React, Java, IoT, Industrial Automation
🚀 Projects - Banking System, IoT Security, E-Commerce, Telegram Bot
💼 Experience - POESSA, JQ Laser
🏆 Achievements - Top performer, innovative solutions
📧 Contact - Email, GitHub, LinkedIn
💼 Hiring - Open for opportunities

What specific information are you looking for?`;
    }

    getAmharicFallbackResponse(userMessage, context) {
        const lowerMessage = userMessage.toLowerCase();
        
        // ትምህርት
        if (lowerMessage.match(/(ትምህርት|ዩኒቨርሲቲ|ዲግሪ|ኮሌጅ|አካዳሚክ)/)) {
            return `🎓 ትምህርት እና አካዳሚክ ስኬት:
• በኮምፒውተር ሳይንስ በሚዛን ጤፒ ዩኒቨርሲቲ B.Sc. ተመርቀዋል
• CGPA: 3.24 (ከፍተኛ ውጤት)
• ብሔራዊ መውጫ ፈተና: 76%
• በሶፍትዌር ምህንድስና መርሆች የላቀ ውጤት`;
        }
        
        // ክህሎቶች
        if (lowerMessage.match(/(ክህሎት|ቴክኖሎጂ|ሙያ|ችሎታ|ብቃት)/)) {
            return `💻 የቴክኒክ ብቃቶች
• Backend ${context.skills.backend.join(', ')} - ጠንካራ፣ ተስፋፊ APIs መገንባት
• Frontend ${context.skills.frontend.join(', ')} - ምላሽ ሰጪ፣ ለተጠቃሚ ምቹ በይነገጾች
• ዳታቤዞች ${context.skills.databases.join(', ')} - የውሂብ ትክክለኛነት እና አፈጻጸም
• ሌሎች ${context.skills.other.join(', ')} - አዳዲስ መፍትሄዎችን መገንባት

በአሁኑ ጊዜ TypeScript እና ክላውድ አርክቴክቸርን እየተማሩ ነው!`;
        }
        
        // የባንክ ፕሮጀክት
        if (lowerMessage.match(/(ባንክ|ገንዘብ|ፋይናንስ|ግብይት)/)) {
            return `🏦 የባንክ ሲስተም ፕሮጀክት
ሞገስ JavaFX እና JDBC በመጠቀም ሙሉ የባንክ አፕሊኬሽን ሠርተዋል። ይህ ሲስተም የሚያካትተው:
• ምስጠራ ያለበት ደህንነቱ የተጠበቀ ግብይት
• ሙሉ የአካውንት አያያዝ (መፍጠር፣ ማዘመን፣ መሰረዝ)
• ለፋይናንስ ሪፖርት ውስብስብ SQL ጥያቄዎች
• የተጠቃሚ ማረጋገጫ እና ፈቃድ

ይህ ፕሮጀክት ለትልልቅ የፋይናንስ ተቋማት ዝግጁ መሆኑን ያሳያል!`;
        }
        
        // IoT ፕሮጀክት
        if (lowerMessage.match(/(iot|smart home|የቤት ደህንነት|fingerprint|ባዮሜትሪክ)/)) {
            return `🔒 IoT Smart Home Security ሲስተም
ሞገስ አዳዲስ ቴክኖሎጂዎችን በማዋሃድ የIoT መሰረት ያለው ደህንነቱ የተጠበቀ የበር መቆለፊያ ሲስተም ሠርተዋል:
• የባዮሜትሪክ የጣት አሻራ ማረጋገጫ
• NodeMCU ማይክሮ መቆጣጠሪያ ውህደት
• ለርቀት ክትትል ክላውድ ግንኙነት
• በቅጽበት የመግቢያ መዝገብ

ይህ ፕሮጀክት ሃርድዌር እና ሶፍትዌርን ያገናኛል!`;
        }
        
        // ሌሎች ፕሮጀክቶች
        if (lowerMessage.match(/(ፕሮጀክት|ሥራ|ግንባታ|ሠራ|ፈጠረ|ሰራ)/)) {
            return `🚀 ዋና ዋና ፕሮጀክቶች

1. የባንክ ሲስተም (JavaFX, JDBC)
   - ሙሉ የገንዘብ ግብይት ሲስተም
   - ደህንነቱ የተጠበቀ የአካውንት አያያዝ

2. IoT Smart Home Security (NodeMCU, Fingerprint)
   - ባዮሜትሪክ ማረጋገጫ
   - ከክላውድ ጋር የተገናኘ ደህንነት

3. Telegram Automation (Node.js, API)
   - አውቶማቲክ መልእክት መዝገብ
   - የውሂብ ማቀነባበሪያ መስመር

4. E-Commerce Platform (React, Node.js, MongoDB)
   - ሙሉ ባህሪ ያለው የመስመር ላይ መደብር
   - የክፍያ ውህደት

እያንዳንዱ ፕሮጀክት በአዲስ የኮድ መፍትሄዎች እውነተኛ ችግሮችን ይፈታል!`;
        }
        
        // ልምድ
        if (lowerMessage.match(/(ልምድ|ሥራ|ስራ|ሙያ|ኢንተርን)/)) {
            return `💼 የሙያ ልምድ

• POESSA (ኢንተርን) - 2024
  - ተለዋዋጭ የድረ-ገጽ መድረኮችን ማዘጋጀት
  - በትብብር እውነተኛ ስርዓቶችን ማሰማራት
  - የምርት አካባቢ ልምድ ማግኘት

• JQ Laser (ኢንዱስትሪያል አውቶሜሽን) - አሁን
  - በኢንዱስትሪ ሌዘር ማሽኖች መሥራት
  - አውቶሜሽን መፍትሄዎችን መተግበር
  - ሶፍትዌርን ከኢንዱስትሪ ቅልጥፍና ጋር ማገናኘት

ሁልጊዜ ለአዳዲስ ፈተናዎች ዝግጁ ናቸው!`;
        }
        
        // ስኬቶች
        if (lowerMessage.match(/(ስኬት|ሽልማት|ውጤት|ደረጃ)/)) {
            return ` ቁልፍ ስኬቶች
• በኮምፒውተር ሳይንስ ክፍል ከፍተኛ ተጫዋች (CGPA: 3.24)
• በብሔራዊ መውጫ ፈተና 76% (ከአማካይ በላይ)
• እውነተኛ የገንዘብ ግብይት ሎጂክ ያለው የባንክ ሲስተም ማሰማራት
• ባዮሜትሪክ ማረጋገጫ ያለው የIoT ደህንነት ሲስተም መገንባት
• ብዙ ለምርት ዝግጁ የሆኑ አፕሊኬሽኖችን መፍጠር`;
        }
        
        // ፍልስፍና
        if (lowerMessage.match(/(ፍልስፍና|ራዕይ|እምነት|አቀራረብ)/)) {
            return `የሙያ ፍልስፍና
"በኮድ እና ፈጠራ የወደፊቱን መቅረጽ"

ሞገስ ቴክኖሎጂ መሳሪያ ብቻ ሳይሆን ለፈጠራ ማዕቀፍ እና ለመዋቅራዊ ለውጥ መካከለኛ ነው ብለው ያምናሉ። ተልዕኮአቸው ኮድን በመጠቀም:
• የኢትዮጵያ ንግዶችን ማብቃት
• አዳዲስ ዲጂታል መፍትሄዎችን መገንባት
• በአካባቢው ቴክ ስነ-ምህዳር ውስጥ ፈጠራን ማንቀሳቀስ

ትርጉም ያላቸውን መፍትሄዎች ለመገንባት ቆርጠው ወጥተዋል!`;
        }
        
        // አድራሻ
        if (lowerMessage.match(/(አድራሻ|ኢሜይል|መገናኛ|ሊንክዲን|ጊትሃብ)/)) {
            return `📧 የመገናኛ መረጃ
• ኢሜይል ${context.contact.email}
• GitHub ${context.contact.github}
• LinkedIn ${context.contact.linkedin}

በኢሜይል መገናኘት በጣም ጥሩ ነው። ብዙውን ጊዜ በ24 ሰዓታት ውስጥ ምላሽ ይሰጣሉ እና ለ:
• ፍሪላንስ ፕሮጀክቶች
• የሙሉ ጊዜ እድሎች
• የቴክኒክ ትብብሮች
• የማማከር ሥራ ክፍት ናቸው`;
        }
        
        // ቅጥር/ሥራ
        if (lowerMessage.match(/(ቅጥር|ሥራ|ክፍያ|ኮንትራት|እድል|ቦታ)/)) {
            return `💼 እድሎች እና ትብብር

ሞገስ በሚከተሉት ዘርፎች እድሎችን በንቃት ይፈልጋሉ:
• የሶፍትዌር ድጋፍ እና ልማት
• Full-Stack ምህንድስና
• ኢንዱስትሪያል አውቶሜሽን
• FinTech መፍትሄዎች

ለቁም ነገር ጥያቄዎች እባክዎ ኢሜይል ያድርጉ: ${context.contact.email}

በተለይ ለኢትዮጵያ ዲጂታል ሽግግር አስተዋጽኦ ለማድረግ ይጓጓሉ!`;
        }
        
        // ስለ ሞገስ መረጃ
        if (lowerMessage.match(/(ማን ነው|ስለ|መረጃ|ንገረኝ)/)) {
            return `👨 ስለ ሞገስ ሺታው

ሞገስ "በኮድ እና ፈጠራ የወደፊቱን መቅረጽ" በሚል እምነት የሚመራ ቀናተኛ ሙሉ ጊዜ ገንቢ ነው።

ዳራ
• ከሚዛን ጤፒ ዩኒቨርሲቲ ተመርቀዋል (CGPA: 3.24)
• በብሔራዊ መውጫ ፈተና 76% አስመዝግበዋል
• በኮምፒውተር ሳይንስ ከፍተኛ ተጫዋች

ብቃት
• ደህንነቱ የተጠበቀ ግብይት ያላቸው የባንክ ሲስተሞች መገንባት
• ባዮሜትሪክ ያላቸው የIoT ደህንነት መፍትሄዎች መፍጠር
• የኢ-ኮሜርስ መድረኮች መገንባት
• አውቶሜሽን መሳሪያዎች እና APIs ማዘጋጀት

ተልዕኮ
ለኢትዮጵያ ኢኮኖሚ ቴክኖሎጂን በመጠቀም ማብቃት፣ ማደስ እና ዲጂታል ለውጥ ማምጣት።

ኮድ ብቻ የሚጽፍ ሳይሆን ትርጉም ያላቸውን መፍትሄዎች የሚያሰላ ገንቢ ነው!`;
        }
        
        // Default response
        return `🤔 ስለ ሞገስ ሺታው ለማወቅ እንዴት ልረዳህ እችላለሁ?

እኔ የሙያ አጋዥ AIው ነኝ። ስለሚከተሉት ነገሮች መጠየቅ ትችላላችሁ:

📚 ትምህርት - CGPA 3.24, 76% የመውጫ ፈተና፣ ሚዛን ጤፒ ዩኒቨርሲቲ
💻 የቴክኒክ ክህሎቶች - Node.js, React, Java, IoT, ኢንዱስትሪያል አውቶሜሽን
🚀 ፕሮጀክቶች - የባንክ ሲስተም, IoT ደህንነት, ኢ-ኮሜርስ, ቴሌግራም ቦት
💼 ልምድ - POESSA, JQ ሌዘር
🏆 ስኬቶች - ከፍተኛ ተጫዋች፣ አዳዲስ መፍትሄዎች
📧 አድራሻ - ኢሜይል, GitHub, LinkedIn
💼 ቅጥር - ለእድሎች ክፍት

ምን ማወቅ ትፈልጋለህ?`;
    }

    async saveChatHistory(userId, messages) {
        console.log(`Saving ${messages.length} messages for user ${userId}`);
        return { success: true };
    }
}

export const chatService = new ChatService();