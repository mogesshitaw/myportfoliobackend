import nodemailer from 'nodemailer';

class EmailConfigManager {
  constructor() {
    this.testAccount = null;  // Store Ethereal test account
    this.config = null;       // Store email configuration
  }

  // Get email transporter (SMTP or Ethereal)
  async getTransporter() {
    // Use SMTP if credentials are configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('📧 Using SMTP email service');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Fallback to Ethereal for testing
    if (!this.testAccount) {
      this.testAccount = await nodemailer.createTestAccount();
      console.log('📧 Ethereal Email Test Account Created:');
      console.log(`   User: ${this.testAccount.user}`);
      console.log(`   Pass: ${this.testAccount.pass}`);
      console.log(`   Preview URL: https://ethereal.email/login`);
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

  // Get Ethereal test account (for development)
  getTestAccount() {
    return this.testAccount;
  }

  // Get email configuration object
  getConfig() {
    if (this.config) return this.config;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        from: process.env.FROM_EMAIL || 'DevPortfolio <noreply@devportfolio.com>',
      };
    } else {
      this.config = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass',
        },
        from: 'DevPortfolio <noreply@devportfolio.com>',
      };
    }

    return this.config;
  }
}

export const emailConfig = new EmailConfigManager();