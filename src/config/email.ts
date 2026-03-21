import nodemailer from 'nodemailer';

interface EmailConfigType {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

class EmailConfigManager {
  private testAccount: nodemailer.TestAccount | null = null;
  private config: EmailConfigType | null = null;

  async getTransporter(): Promise<nodemailer.Transporter> {
    // Always use SMTP if configured
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

    // Fallback to Ethereal if no SMTP configured
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

  getTestAccount(): nodemailer.TestAccount | null {
    return this.testAccount;
  }

  getConfig(): EmailConfigType {
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