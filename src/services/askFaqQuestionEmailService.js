import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

class AskFaqQuestionEmailService {
  constructor() {
    this.transporter = null;
  }

  async getTransporter() {
    if (!this.transporter) {
      this.transporter = await emailConfig.getTransporter();
    }
    return this.transporter;
  }

  async sendEmail(options) {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log(`✅ FAQ Email sent: ${info.messageId}`);
      
      if (process.env.NODE_ENV !== 'production') {
        const testAccount = emailConfig.getTestAccount();
        if (testAccount) {
          console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send FAQ email:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  // Send question notification to admin
  async sendQuestionNotification(data) {
    const { name, email, question } = data;
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!adminEmail) {
      console.error('❌ Admin email not configured. Set ADMIN_EMAIL or SMTP_USER in environment variables.');
      return;
    }
    
    const emailContent = {
      subject: `❓ New Question from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New FAQ Question</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; font-size: 28px; margin: 0; }
            .content { padding: 30px; }
            .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
            .label { font-weight: 600; color: #374151; margin-bottom: 8px; }
            .value { color: #6b7280; margin-bottom: 16px; word-break: break-word; }
            .question-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #f59e0b; }
            .question-text { font-style: italic; color: #374151; line-height: 1.7; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❓ New FAQ Question</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">📧 From:</div>
                <div class="value">${escapeHtml(name)} (${escapeHtml(email)})</div>
                
                <div class="label">📅 Submitted:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
              
              <div class="question-box">
                <div class="label">💬 Question:</div>
                <div class="question-text">"${escapeHtml(question).replace(/\n/g, '<br>')}"</div>
              </div>
              
              <div class="divider"></div>
              
              <p style="color: #4b5563; margin-bottom: 16px;">
                A visitor has submitted a question through the FAQ page. Please respond within 24-48 hours.
              </p>
              
              <a href="mailto:${escapeHtml(email)}?subject=Re: Your Question" class="button">
                Reply to ${escapeHtml(name)}
              </a>
            </div>
            <div class="footer">
              <p>This message was sent from your portfolio FAQ page.</p>
              <p>© ${new Date().getFullYear()} Moges Shitaw | Full Stack Developer</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New FAQ Question
        
        From: ${name} (${email})
        Submitted: ${new Date().toLocaleString()}
        
        Question:
        "${question}"
        
        Reply to: ${email}
        
        This message was sent from your portfolio FAQ page.
      `
    };
    
    await this.sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    // Send auto-reply to the user
    await this.sendQuestionAutoReply({ name, email, question });
  }

  // Send auto-reply to user after they submit a question
  async sendQuestionAutoReply(data) {
    const { name, email, question } = data;
    
    const emailContent = {
      subject: `Thank You for Your Question - MsPortfolio`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Your Question</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; font-size: 28px; margin: 0; }
            .content { padding: 30px; }
            .question-preview { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .faq-link { color: #667eea; text-decoration: none; }
            .faq-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Question! 🙌</h1>
            </div>
            <div class="content">
              <p>Dear ${escapeHtml(name)},</p>
              
              <p>Thank you for reaching out! I've received your question and will get back to you within 24-48 hours.</p>
              
              <div class="question-preview">
                <p style="font-weight: 600; margin-bottom: 8px;">Your Question:</p>
                <p style="font-style: italic; color: #4b5563;">"${escapeHtml(question).substring(0, 200)}${question.length > 200 ? '...' : ''}"</p>
              </div>
              
              <p>In the meantime, you might find answers in the <a href="${process.env.FRONTEND_URL}/faq" class="faq-link">FAQ section</a>.</p>
              
              <a href="${process.env.FRONTEND_URL}" class="button">
                Visit My Portfolio
              </a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Moges Shitaw | Full Stack Developer</p>
              <p>📧 mogesshitaw318@gmail.com | 📱 +251 935 945 658</p>
              <p style="margin-top: 10px;">This is an automated response. I'll personally respond to your question soon!</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank You for Your Question!
        
        Dear ${name},
        
        Thank you for reaching out! I've received your question and will get back to you within 24-48 hours.
        
        Your Question:
        "${question}"
        
        In the meantime, you might find answers in the FAQ section: ${process.env.FRONTEND_URL}/faq
        
        Visit my portfolio: ${process.env.FRONTEND_URL}
        
        Best regards,
        Moges Shitaw
        Full Stack Developer
        
        Email: mogesshitaw318@gmail.com
        Phone: +251 935 945 658
      `
    };
    
    await this.sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
  }
}

// Helper function to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const askFaqQuestionEmailService = new AskFaqQuestionEmailService();