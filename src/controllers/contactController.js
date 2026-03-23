import { prisma } from '../index.ts';
import { emailService } from '../services/emailService.ts';

// Send contact message
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, service, message, agree } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, subject, and message'
      });
    }

    if (!agree) {
      return res.status(400).json({
        success: false,
        error: 'You must agree to the terms and privacy policy'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Save contact message to database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        service: service || null,
        message,
        isRead: false,
      }
    });

    // Send email notification to admin
    try {
      await emailService.sendContactNotification({
        name,
        email,
        subject,
        service,
        message,
        contactId: contact.id
      });
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    // Send auto-reply to user
    try {
      await emailService.sendContactAutoReply({
        name,
        email,
        subject,
      });
    } catch (emailError) {
      console.error('Failed to send auto-reply email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. I\'ll get back to you soon.',
      data: contact
    });

  } catch (error) {
    console.error('Send contact message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again later.'
    });
  }
};

// Get all contact messages (admin only)
export const getAllContactMessages = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { status, limit = 50 } = req.query;
    
    const where = {};
    if (status === 'read') {
      where.isRead = true;
    } else if (status === 'unread') {
      where.isRead = false;
    }

    const messages = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Get single contact message (admin only)
export const getContactMessageById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { id } = req.params;
    
    const message = await prisma.contact.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Mark as read
    if (!message.isRead) {
      await prisma.contact.update({
        where: { id },
        data: { isRead: true }
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message'
    });
  }
};

// Mark message as read/unread (admin only)
export const toggleMessageReadStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { isRead } = req.body;

    const message = await prisma.contact.update({
      where: { id },
      data: { isRead: isRead !== undefined ? isRead : true }
    });

    res.json({
      success: true,
      data: message,
      message: `Message marked as ${message.isRead ? 'read' : 'unread'}`
    });

  } catch (error) {
    console.error('Toggle message status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message status'
    });
  }
};

// Delete contact message (admin only)
export const deleteContactMessage = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { id } = req.params;

    await prisma.contact.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
};

// Get contact statistics (admin only)
export const getContactStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const totalMessages = await prisma.contact.count();
    const unreadMessages = await prisma.contact.count({
      where: { isRead: false }
    });
    const messagesThisMonth = await prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1))
        }
      }
    });

    const messagesByService = await prisma.contact.groupBy({
      by: ['service'],
      _count: {
        service: true
      },
      where: {
        service: {
          not: null
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        messagesThisMonth,
        messagesByService
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};
// Reply to contact message (admin only)
export const replyToContactMessage = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { messageId, to, reply } = req.body;

    if (!messageId || !to || !reply) {
      return res.status(400).json({
        success: false,
        error: 'Message ID, recipient email, and reply are required'
      });
    }

    // Get the original message
    const originalMessage = await prisma.contact.findUnique({
      where: { id: messageId }
    });

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        error: 'Original message not found'
      });
    }

    // Send email reply
    await emailService.sendContactReply({
      to,
      name: originalMessage.name,
      subject: originalMessage.subject,
      reply,
    });

    // Update message as replied (optional - add replied field to schema)
    // await prisma.contact.update({
    //   where: { id: messageId },
    //   data: { replied: true, repliedAt: new Date() }
    // });

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send reply'
    });
  }
};