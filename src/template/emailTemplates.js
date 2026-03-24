export const emailTemplates = {
  welcome: (data) => ({
    subject: '🎉 Welcome to MsPortfolio!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MsPortfolio</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; font-size: 32px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #1f2937; margin-bottom: 20px; font-size: 24px; }
          .content p { color: #4b5563; margin-bottom: 15px; }
          .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .feature { text-align: center; padding: 20px; background: #f9fafb; border-radius: 12px; }
          .feature span { font-size: 32px; display: block; margin-bottom: 10px; }
          .feature h4 { color: #1f2937; margin-bottom: 5px; }
          .feature p { color: #6b7280; font-size: 14px; margin: 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500; margin-top: 30px; transition: background 0.3s; }
          .button:hover { background: #1d4ed8; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #6b7280; font-size: 14px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to MsPortfolio!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.userName},</h2>
            <p>We're absolutely thrilled to have you join our community of developers and creators! 🎉</p>
            
            <div class="features">
              <div class="feature">
                <span>📊</span>
                <h4>Showcase Projects</h4>
                <p>Display your best work</p>
              </div>
              <div class="feature">
                <span>💬</span>
                <h4>Real-time Chat</h4>
                <p>Connect with clients</p>
              </div>
              <div class="feature">
                <span>📁</span>
                <h4>File Sharing</h4>
                <p>Share securely</p>
              </div>
              <div class="feature">
                <span>📈</span>
                <h4>Track Progress</h4>
                <p>Monitor engagement</p>
              </div>
            </div>

            <p>Here's what you can do next:</p>
            <ul style="color: #4b5563; margin-left: 20px;">
              <li>✨ Create your first project</li>
              <li>🔗 Share your portfolio link</li>
              <li>💬 Start connecting with clients</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/projects" class="button">
                Create Your First Project →
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${data.year || new Date().getFullYear()} MsPortfolio. All rights reserved.</p>
            <p style="font-size: 12px;">If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to MsPortfolio, ${data.userName}! 🎉

      We're thrilled to have you join our community. Here's what you can do:
      - Showcase your projects
      - Connect with clients via real-time chat
      - Share files securely
      - Track engagement

      Get started: ${process.env.FRONTEND_URL}/projects
    `,
  }),

  projectCreated: (data) => ({
    subject: `🎯 Project Created: ${data.projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .project-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Project Created Successfully!</h1>
          </div>
          <div class="content">
            <h2>Great job, ${data.userName}!</h2>
            <p>Your project "<strong>${data.projectTitle}</strong>" has been created and is now live.</p>
            
            <div class="project-card">
              <h3>📊 What happens next?</h3>
              <ul style="color: #4b5563;">
                <li>👀 Clients can now view your project</li>
                <li>💬 They can contact you via chat</li>
                <li>❤️ Receive likes and comments</li>
                <li>📈 Track engagement in real-time</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/projects/${data.projectId}" class="button">
                View Your Project →
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© ${data.year || new Date().getFullYear()} MsPortfolio</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Great job, ${data.userName}! Your project "${data.projectTitle}" has been created and is now live.

      What happens next?
      - Clients can now view your project
      - They can contact you via chat
      - Receive likes and comments
      - Track engagement in real-time

      View your project: ${process.env.FRONTEND_URL}/projects/${data.projectId}
    `,
  }),

  newComment: (data) => ({
    subject: `💬 New Comment on "${data.projectTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; }
          .header { background: #2563eb; padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .comment-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .commenter { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .avatar { width: 40px; height: 40px; background: #2563eb; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Comment Alert</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            
            <div class="comment-box">
              <div class="commenter">
                <div class="avatar">${data.commenterName?.charAt(0)}</div>
                <div>
                  <strong style="color: #1f2937;">${data.commenterName}</strong>
                  <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">commented on your project</span>
                </div>
              </div>
              <p style="background: white; padding: 15px; border-radius: 6px; font-style: italic;">
                "${data.commentContent}"
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/projects/${data.projectId}" class="button">
                View and Reply →
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${data.userName},

      ${data.commenterName} commented on your project "${data.projectTitle}":
      "${data.commentContent}"

      View and reply: ${process.env.FRONTEND_URL}/projects/${data.projectId}
    `,
  }),

  newLike: (data) => ({
    subject: `❤️ ${data.likerName} liked your project`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; }
          .header { background: #dc2626; padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; text-align: center; }
          .heart { font-size: 48px; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❤️ New Like!</h1>
          </div>
          <div class="content">
            <div class="heart">❤️</div>
            <h2>Great news, ${data.userName}!</h2>
            <p><strong>${data.likerName}</strong> liked your project</p>
            <p style="font-size: 18px; color: #2563eb; margin: 10px 0;">"${data.projectTitle}"</p>
            
            <a href="${process.env.FRONTEND_URL}/projects/${data.projectId}" class="button">
              View Your Project
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Great news, ${data.userName}!
      ${data.likerName} liked your project "${data.projectTitle}".

      View your project: ${process.env.FRONTEND_URL}/projects/${data.projectId}
    `,
  }),

  newMessage: (data) => ({
    subject: `💌 New message from ${data.senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; }
          .header { background: #059669; padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .message-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💌 New Message</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${data.userName}</strong>,</p>
            <p><strong>${data.senderName}</strong> sent you a message about "${data.projectTitle}":</p>
            
            <div class="message-box">
              <p style="margin: 0; font-style: italic;">"${data.messageContent?.substring(0, 150)}${(data.messageContent?.length || 0) > 150 ? '...' : ''}"</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/chat" class="button">
                Open Chat →
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${data.userName},
      ${data.senderName} sent you a message about "${data.projectTitle}":
      "${data.messageContent}"

      Open chat: ${process.env.FRONTEND_URL}/chat
    `,
  }),
};