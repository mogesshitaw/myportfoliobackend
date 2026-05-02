export const emailTemplates = {
welcome: (data) => ({
  subject: '✨Welcome to Moges Shitaw Portfolio',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Moges Shitaw Portfolio</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          line-height: 1.6;
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header { 
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          padding: 50px 30px; 
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '</>';
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 60px;
          opacity: 0.1;
          color: white;
          font-family: monospace;
        }
        .profile-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .header h1 { 
          color: white; 
          font-size: 28px; 
          margin-bottom: 10px;
          font-weight: 700;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
        }
        .content { 
          padding: 40px 35px; 
          background: white;
        }
        .greeting {
          font-size: 24px;
          color: #1e3c72;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .intro {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 25px;
          border-radius: 15px;
          margin: 20px 0;
          text-align: center;
        }
        .intro h3 {
          color: #1e3c72;
          margin-bottom: 10px;
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
          justify-content: center;
        }
        .skill-tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .services {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
        }
        .service-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .service-item:last-child {
          border-bottom: none;
        }
        .service-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .service-text {
          flex: 1;
        }
        .service-text h4 {
          color: #1e3c72;
          margin-bottom: 5px;
        }
        .service-text p {
          color: #6b7280;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 14px 35px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: center;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102,126,234,0.4);
        }
        .contact-info {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          margin: 25px 0;
        }
        .contact-info h3 {
          margin-bottom: 15px;
        }
        .contact-details {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .contact-details a {
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 25px;
          transition: background 0.3s;
        }
        .contact-details a:hover {
          background: rgba(255,255,255,0.3);
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 12px;
          margin: 5px 0;
        }
        .social-links {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 15px 0;
        }
        .social-links a {
          color: #667eea;
          text-decoration: none;
          font-size: 20px;
        }
        @media (max-width: 480px) {
          .content { padding: 25px 20px; }
          .greeting { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="profile-icon">
            👨‍💻
          </div>
          <h1>Welcome to My Digital Space! 🚀</h1>
          <p>Full Stack Developer | Problem Solver | Tech Enthusiast</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Welcome , ${data.userName || 'Friend'}! 👋
          </div>
          
          <div class="intro">
            <h3>💡 About Me</h3>
            <p>I'm <strong>Moges Shitaw</strong>, a passionate Full Stack Developer dedicated to creating innovative web solutions that make a difference. With expertise in modern technologies, I help businesses bring their ideas to life.</p>
            <div class="skills">
              <span class="skill-tag">React</span>
              <span class="skill-tag">Node.js</span>
              <span class="skill-tag">Next.js</span>
              <span class="skill-tag">TypeScript</span>
              <span class="skill-tag">PostgreSQL</span>
            </div>
          </div>
          
          <div class="services">
            <h3 style="text-align: center; margin-bottom: 20px; color: #1e3c72;">✨ What I Offer</h3>
            
            <div class="service-item">
              <div class="service-icon">🌐</div>
              <div class="service-text">
                <h4>Full Stack Development</h4>
                <p>End-to-end web applications using modern technologies</p>
              </div>
            </div>
            
            <div class="service-item">
              <div class="service-icon">📱</div>
              <div class="service-text">
                <h4>Responsive Design</h4>
                <p>Mobile-first websites that work on all devices</p>
              </div>
            </div>
            
            <div class="service-item">
              <div class="service-icon">⚡</div>
              <div class="service-text">
                <h4>Performance Optimization</h4>
                <p>Fast-loading, SEO-friendly applications</p>
              </div>
            </div>
            
            <div class="service-item">
              <div class="service-icon">🔒</div>
              <div class="service-text">
                <h4>Secure Solutions</h4>
                <p>Best security practices for data protection</p>
              </div>
            </div>
          </div>
          
          <p style="text-align: center; margin: 20px 0;">
            Looking for a professional to bring your project to life? <strong>Let's work together!</strong>
          </p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" class="cta-button">
              📩 Hire Me → Let's Discuss Your Project
            </a>
          </div>
          
          <div class="contact-info">
            <h3>📞 Get in Touch</h3>
            <p style="margin-bottom: 15px;">Have a project in mind? Let's bring your ideas to reality!</p>
            <div class="contact-details">
              <a href="mailto:mogesshitaw7702@gmail.com">
                📧 Email Me
              </a>
              <a href="https://t.me/moges_shitaw">
                💬 Telegram
              </a>
              <a href="https://github.com/mogesshitaw">
                💻 GitHub
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #6b7280;">
              ⭐ Check out my portfolio to see what I've built:<br>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/myprojects" style="color: #667eea;">
                View My Work →
              </a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://github.com/mogesshitaw">🐙 GitHub</a>
            <a href="https://linkedin.com/in/moges-shitaw">🔗 LinkedIn</a>
            <a href="https://t.me/moges_shitaw">📱 Telegram</a>
          </div>
          <p>© ${data.year || new Date().getFullYear()} Moges Shitaw | Full Stack Developer</p>
          <p>Building digital solutions with passion and expertise</p>
          <p style="font-size: 11px;">
            You're receiving this email because you signed up on my portfolio.<br>
            ${process.env.FRONTEND_URL || 'http://localhost:3000'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    ✨ Welcome to Moges Shitaw's Portfolio! ✨
    
    Hello ${data.userName || 'Friend'},
    
    I'm Moges Shitaw, a Full Stack Developer passionate about creating innovative web solutions.
    
    💡 What I Offer:
    • Full Stack Development (React, Node.js, Next.js)
    • Responsive Web Design
    • Performance Optimization
    • Secure Web Applications
    
    🚀 Ready to bring your project to life?
    Contact me today for a free consultation!
    
    📧 Email: mogesshitaw7702@gmail.com
    💬 Telegram: t.me/moges_shitaw
    💻 GitHub: github.com/mogesshitaw
    
    View my portfolio: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/myprojects
    Hire me: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact
    
    ---
    Moges Shitaw | Full Stack Developer
    Building digital solutions with passion and expertise
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
            <p>© ${data.year || new Date().getFullYear()} DevPortfolio</p>
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