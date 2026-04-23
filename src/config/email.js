import nodemailer from 'nodemailer';
import 'dotenv/config';

class EmailConfigManager {
    constructor() {
        this.testAccount = null;
        this.config = null;
        this.brevoApiKey = process.env.BREVO_API_KEY;
        this.validateEnvironmentVariables();
    }

    validateEnvironmentVariables() {
        console.log('🔍 Email Configuration Check:');
        console.log(`   BREVO_API_KEY: ${this.brevoApiKey ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        
        if (!this.brevoApiKey && !process.env.SMTP_USER) {
            console.log('⚠️ No email credentials found, will use Ethereal for testing');
        }
    }

    async getTransporter() {
        // Priority 1: Use Brevo HTTP API (works on Render!)
        if (this.brevoApiKey) {
            console.log('📧 Using Brevo HTTP API for email service (Render-compatible)');
            return this.createBrevoApiTransport();
        }
        
        // Priority 2: Use SMTP if available (for local development)
        if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
            console.log('📧 Attempting SMTP connection (local development)...');
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                    connectionTimeout: 10000,
                    greetingTimeout: 10000,
                });
                
                await transporter.verify();
                console.log('✅ SMTP connection successful');
                return transporter;
            } catch (error) {
                console.error('❌ SMTP connection failed:', error.message);
                console.log('⚠️ Falling back to Ethereal...');
            }
        }
        
        // Priority 3: Fallback to Ethereal for testing
        return await this.getEtherealTransporter();
    }

    createBrevoApiTransport() {
        const brevoApiKey = this.brevoApiKey;
        const fromEmail = process.env.FROM_EMAIL || 'MsPortfolio <mogesshitaw7702@gmail.com>';
        
        // Parse from email
        const fromMatch = fromEmail.match(/(.*?)\s*<(.*?)>/);
        const senderName = fromMatch ? fromMatch[1].trim() : 'MsPortfolio';
        const senderEmail = fromMatch ? fromMatch[2] : 'mogesshitaw7702@gmail.com';
        
        return {
            sendMail: async (mailOptions) => {
                try {
                    console.log('📧 Sending email via Brevo HTTP API...');
                    
                    // Prepare recipients
                    const to = Array.isArray(mailOptions.to) 
                        ? mailOptions.to.map(email => ({ email: typeof email === 'string' ? email : email.email }))
                        : [{ email: mailOptions.to }];
                    
                    const cc = mailOptions.cc 
                        ? (Array.isArray(mailOptions.cc) 
                            ? mailOptions.cc.map(email => ({ email }))
                            : [{ email: mailOptions.cc }])
                        : undefined;
                    
                    const bcc = mailOptions.bcc 
                        ? (Array.isArray(mailOptions.bcc) 
                            ? mailOptions.bcc.map(email => ({ email }))
                            : [{ email: mailOptions.bcc }])
                        : undefined;
                    
                    // Prepare email payload for Brevo API
                    const emailPayload = {
                        sender: {
                            name: senderName,
                            email: senderEmail
                        },
                        to: to,
                        subject: mailOptions.subject,
                        htmlContent: mailOptions.html || mailOptions.text,
                        textContent: mailOptions.text,
                    };
                    
                    if (cc) emailPayload.cc = cc;
                    if (bcc) emailPayload.bcc = bcc;
                    
                    if (mailOptions.replyTo) {
                        emailPayload.replyTo = {
                            email: mailOptions.replyTo,
                            name: mailOptions.replyToName || 'Reply'
                        };
                    }
                    
                    // Make API request to Brevo
                    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'api-key': brevoApiKey,
                        },
                        body: JSON.stringify(emailPayload)
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to send email via Brevo API');
                    }
                    
                    console.log('✅ Email sent successfully via Brevo API');
                    console.log(`   Message ID: ${data.messageId}`);
                    
                    return { 
                        messageId: data.messageId,
                        response: data
                    };
                } catch (error) {
                    console.error('❌ Brevo API error:', error.message);
                    throw new Error(`Failed to send email: ${error.message}`);
                }
            },
            
            verify: async () => {
                try {
                    // Test the API key by making a simple request
                    const response = await fetch('https://api.brevo.com/v3/account', {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'api-key': brevoApiKey,
                        }
                    });
                    
                    if (response.ok) {
                        console.log('✅ Brevo API connection verified');
                        return true;
                    } else {
                        throw new Error('Invalid API key');
                    }
                } catch (error) {
                    console.error('❌ Brevo API verification failed:', error.message);
                    throw error;
                }
            },
            
            close: () => {
                console.log('📧 Brevo API transporter closed');
            }
        };
    }

    async getEtherealTransporter() {
        if (!this.testAccount) {
            try {
                this.testAccount = await nodemailer.createTestAccount();
                console.log('📧 Ethereal Email Test Account Created:');
                console.log(`   User: ${this.testAccount.user}`);
                console.log(`   Pass: ${this.testAccount.pass}`);
                console.log(`   Preview URL: https://ethereal.email/login`);
            } catch (error) {
                console.error('❌ Failed to create Ethereal test account:', error.message);
                throw new Error('No email service available');
            }
        }
        
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: this.testAccount.user,
                pass: this.testAccount.pass,
            },
        });
    }

    getConfig() {
        if (this.config) return this.config;
        
        if (this.brevoApiKey) {
            this.config = {
                service: 'brevo-api',
                from: process.env.FROM_EMAIL || 'MsPortfolio <mogesshitaw7702@gmail.com>',
                isBrevoAPI: true,
            };
            console.log('📧 Using Brevo API configuration (Render-optimized)');
        } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.config = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                from: process.env.FROM_EMAIL || 'DevPortfolio <noreply@devportfolio.com>',
                isSMTP: true,
                service: 'smtp',
            };
            console.log('📧 Using SMTP configuration');
        } else {
            this.config = {
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: this.testAccount?.user || 'ethereal.user@ethereal.email',
                    pass: this.testAccount?.pass || 'ethereal.pass',
                },
                from: 'DevPortfolio <noreply@devportfolio.com>',
                service: 'ethereal',
            };
            console.log('📧 Using Ethereal configuration (testing mode)');
        }
        
        return this.config;
    }

    async sendTestEmail(to, subject, text) {
        try {
            console.log(`📧 Sending test email to ${to}...`);
            const transporter = await this.getTransporter();
            const config = this.getConfig();
            
            const info = await transporter.sendMail({
                from: config.from,
                to: to,
                subject: subject || 'Test Email from Portfolio',
                text: text || 'This is a test email to verify email configuration.',
                html: `<h2>Test Email</h2><p>${text || 'This is a test email to verify email configuration.'}</p><br/><p>Sent at: ${new Date().toISOString()}</p>`,
            });
            
            console.log('✅ Test email sent successfully');
            
            if (config.service === 'ethereal' && info.messageId) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log(`   📧 Preview URL: ${previewUrl}`);
            }
            
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Failed to send test email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendEmail(options) {
        try {
            const transporter = await this.getTransporter();
            const config = this.getConfig();
            
            const result = await transporter.sendMail({
                from: options.from || config.from,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
            });
            
            if (config.service === 'ethereal' && result.messageId) {
                const previewUrl = nodemailer.getTestMessageUrl(result);
                console.log(`   📧 Preview URL: ${previewUrl}`);
            }
            
            return { success: true, result };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export const emailConfig = new EmailConfigManager();
