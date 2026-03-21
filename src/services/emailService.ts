import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';
import { emailTemplates } from '../template/emailTemplates.js';
import { prisma } from '../index.js';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface NotificationData {
  userId: string;
  type: 'welcome' | 'project_created' | 'new_comment' | 'new_like' | 'new_message' | 'contact_message';
  data: Record<string, any>;
  projectId?: string;
}

interface ContactNotificationData {
  name: string;
  email: string;
  subject: string;
  service?: string;
  message: string;
  contactId: string;
}

interface ContactAutoReplyData {
  name: string;
  email: string;
  subject: string;
}

interface ContactReplyData {
  to: string;
  name: string;
  subject: string;
  reply: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = await emailConfig.getTransporter();
    }
    return this.transporter;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || '"DevPortfolio" <noreply@devportfolio.com>',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent: ${info.messageId}`);
      
      // Show preview URL in development
      if (process.env.NODE_ENV !== 'production') {
        const testAccount = emailConfig.getTestAccount();
        if (testAccount) {
          console.log(`📬 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async createAndSendNotification(notificationData: NotificationData): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: notificationData.userId },
        select: { email: true, fullName: true }
      });

      if (!user) {
        console.error(`User ${notificationData.userId} not found`);
        return;
      }

      const templateData = {
        userName: user.fullName,
        year: new Date().getFullYear(),
        ...notificationData.data,
      };

      let emailContent;
      switch (notificationData.type) {
        case 'welcome':
          emailContent = emailTemplates.welcome(templateData);
          break;
        case 'project_created':
          emailContent = emailTemplates.projectCreated(templateData);
          break;
        case 'new_comment':
          emailContent = emailTemplates.newComment(templateData);
          break;
        case 'new_like':
          emailContent = emailTemplates.newLike(templateData);
          break;
        case 'new_message':
          emailContent = emailTemplates.newMessage(templateData);
          break;
        default:
          console.error(`Unknown notification type: ${notificationData.type}`);
          return;
      }

      // Create notification in database
      await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: emailContent.subject,
          content: notificationData.data.content || '',
          data: notificationData.data,
          projectId: notificationData.projectId,
        },
      });

      // Send email
      await this.sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

    } catch (error) {
      console.error('❌ Failed to create and send notification:', error);
    }
  }

  // Convenience methods
  async sendWelcome(userId: string): Promise<void> {
    console.log(`📧 Sending welcome email to user: ${userId}`);
    await this.createAndSendNotification({
      userId,
      type: 'welcome',
      data: {},
    });
  }

  async sendProjectCreated(userId: string, projectTitle: string, projectId: string): Promise<void> {
    console.log(`📧 Sending project created email to user: ${userId} for project: ${projectTitle}`);
    await this.createAndSendNotification({
      userId,
      type: 'project_created',
      data: { projectTitle, projectId },
      projectId,
    });
  }

  async sendNewComment(
    projectOwnerId: string,
    commenterName: string,
    projectTitle: string,
    projectId: string,
    commentContent: string
  ): Promise<void> {
    console.log(`📧 Sending new comment email to user: ${projectOwnerId} from: ${commenterName}`);
    await this.createAndSendNotification({
      userId: projectOwnerId,
      type: 'new_comment',
      data: { commenterName, projectTitle, projectId, commentContent },
      projectId,
    });
  }

  async sendNewLike(
    projectOwnerId: string,
    likerName: string,
    projectTitle: string,
    projectId: string
  ): Promise<void> {
    console.log(`📧 Sending new like email to user: ${projectOwnerId} from: ${likerName}`);
    await this.createAndSendNotification({
      userId: projectOwnerId,
      type: 'new_like',
      data: { likerName, projectTitle, projectId },
      projectId,
    });
  }

  async sendNewMessage(
    recipientId: string,
    senderName: string,
    projectTitle: string,
    messageContent: string
  ): Promise<void> {
    console.log(`📧 Sending new message email to user: ${recipientId} from: ${senderName}`);
    await this.createAndSendNotification({
      userId: recipientId,
      type: 'new_message',
      data: { senderName, projectTitle, messageContent },
    });
  }

  // Send contact notification to admin
  async sendContactNotification(data: ContactNotificationData): Promise<void> {
    const { name, email, subject, service, message, contactId } = data;
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!adminEmail) {
      console.error('❌ Admin email not configured. Set ADMIN_EMAIL or SMTP_USER in environment variables.');
      console.log('💡 Check Ethereal preview URL in console for test emails.');
      return;
    }
    
    const emailContent = {
      subject: `📬 New Contact Message: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .info-box { background: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
            .label { font-weight: 600; color: #374151; margin-bottom: 4px; }
            .value { color: #6b7280; margin-bottom: 12px; }
            .message-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 15px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Contact Message</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">From:</div>
                <div class="value">${escapeHtml(name)} (${escapeHtml(email)})</div>
                
                <div class="label">Subject:</div>
                <div class="value">${escapeHtml(subject)}</div>
                
                ${service ? `
                  <div class="label">Service Interested:</div>
                  <div class="value">${escapeHtml(service)}</div>
                ` : ''}
              </div>
              
              <div class="message-box">
                <div class="label">Message:</div>
                <div class="value">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
              </div>
              
              <a href="${process.env.FRONTEND_URL}/admin/contacts/${contactId}" class="button">
                View in Admin Panel
              </a>
            </div>
            <div class="footer">
              <p>This message was sent from your portfolio contact form.</p>
              <p>© ${new Date().getFullYear()} DevPortfolio</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New Contact Message
        
        From: ${name} (${email})
        Subject: ${subject}
        ${service ? `Service: ${service}` : ''}
        
        Message:
        ${message}
        
        View in admin panel: ${process.env.FRONTEND_URL}/admin/contacts/${contactId}
      `
    };
    
    await this.sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
  }

  // Send reply to contact message
  async sendContactReply(data: ContactReplyData): Promise<void> {
    const { to, name, subject, reply } = data;
    
    const emailContent = {
      subject: `Re: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .reply-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Response from Moges Shitaw</h1>
            </div>
            <div class="content">
              <p>Dear ${escapeHtml(name)},</p>
              
              <div class="reply-box">
                <p style="margin: 0; font-style: italic;">${escapeHtml(reply).replace(/\n/g, '<br>')}</p>
              </div>
              
              <div class="signature">
                <p>Best regards,<br>
                <strong>Moges Shitaw</strong><br>
                Full Stack Developer</p>
                <p style="font-size: 12px; color: #6b7280;">
                  📧 mogesshitaw318@gmail.com | 📱 +251 935 945 658<br>
                  🌐 ${process.env.FRONTEND_URL}
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Moges Shitaw | Full Stack Developer</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Dear ${name},
        
        ${reply}
        
        Best regards,
        Moges Shitaw
        Full Stack Developer
        
        Email: mogesshitaw318@gmail.com
        Phone: +251 935 945 658
        Portfolio: ${process.env.FRONTEND_URL}
      `
    };
    
    await this.sendEmail({
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
  }

  // Send auto-reply to user
  async sendContactAutoReply(data: ContactAutoReplyData): Promise<void> {
    const { name, email, subject } = data;
    
    if (!email) {
      console.error('❌ User email is required for auto-reply');
      return;
    }
    
    const emailContent = {
      subject: `Thank you for reaching out! - DevPortfolio`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Reaching Out! 🙌</h1>
            </div>
            <div class="content">
              <p>Dear ${escapeHtml(name)},</p>
              <p>Thank you for contacting me! I've received your message regarding "<strong>${escapeHtml(subject)}</strong>" and will get back to you within 24 hours.</p>
              
              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Check out my <a href="${process.env.FRONTEND_URL}/myprojects">latest projects</a></li>
                <li>Read what <a href="${process.env.FRONTEND_URL}/testimonials">clients say about my work</a></li>
                <li>Learn more about <a href="${process.env.FRONTEND_URL}/services">the services I offer</a></li>
              </ul>
              
              <a href="${process.env.FRONTEND_URL}" class="button">
                Visit My Portfolio
              </a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Moges Shitaw | Full Stack Developer</p>
              <p>Email: mogesshitaw318@gmail.com | Phone: +251 935 945 658</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank You for Reaching Out!
        
        Dear ${name},
        
        Thank you for contacting me! I've received your message regarding "${subject}" and will get back to you within 24 hours.
        
        In the meantime, feel free to:
        - Check out my latest projects: ${process.env.FRONTEND_URL}/myprojects
        - Read what clients say: ${process.env.FRONTEND_URL}/testimonials
        - Learn about my services: ${process.env.FRONTEND_URL}/services
        
        Visit my portfolio: ${process.env.FRONTEND_URL}
        
        Best regards,
        Moges Shitaw
        Full Stack Developer
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
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const emailService = new EmailService();