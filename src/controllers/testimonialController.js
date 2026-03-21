import { prisma } from '../index.js';

// Get all testimonials (admin) - includes pending
export const getAllTestimonials = async (req, res) => {
  try {
    // isAdmin middleware already checked, so we can proceed
    const { status, featured, limit = 50 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (featured === 'true') {
      where.featured = true;
      where.status = 'approved';
    } else if (featured === 'false') {
      where.featured = false;
    }
    
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonials'
    });
  }
};

// Get active testimonials for public view (only approved and optionally featured)
export const getActiveTestimonials = async (req, res) => {
  try {
    const { featured, limit = 10 } = req.query;
    
    const where = {
      status: 'approved'
    };
    
    if (featured === 'true') {
      where.featured = true;
    }
    
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Get active testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonials'
    });
  }
};

// Get single testimonial
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonial'
    });
  }
};

// Create testimonial (public - requires approval)
export const createTestimonial = async (req, res) => {
  try {
    const { author, position, content, rating, avatarUrl } = req.body;
    
    if (!author || !position || !content) {
      return res.status(400).json({
        success: false,
        error: 'Author, position and content are required'
      });
    }
    
    const testimonial = await prisma.testimonial.create({
      data: {
        author,
        position,
        content,
        rating: rating || 5,
        avatarUrl,
        status: 'pending',  // Needs admin approval
        featured: false
      }
    });
    
    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'Thank you for your testimonial! It will be reviewed by admin.'
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create testimonial'
    });
  }
};

// Update testimonial (admin only)
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, position, content, rating, avatarUrl } = req.body;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update testimonials'
      });
    }
    
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        author: author || existingTestimonial.author,
        position: position || existingTestimonial.position,
        content: content || existingTestimonial.content,
        rating: rating !== undefined ? rating : existingTestimonial.rating,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existingTestimonial.avatarUrl
      }
    });
    
    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update testimonial'
    });
  }
};

// Approve testimonial (admin only)
export const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can approve testimonials'
      });
    }
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      data: updated,
      message: 'Testimonial approved successfully'
    });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve testimonial'
    });
  }
};

// Reject testimonial (admin only)
export const rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can reject testimonials'
      });
    }
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      data: updated,
      message: 'Testimonial rejected'
    });
  } catch (error) {
    console.error('Reject testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject testimonial'
    });
  }
};

// Toggle featured status (admin only)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can manage featured testimonials'
      });
    }
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    // Only approved testimonials can be featured
    if (testimonial.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Only approved testimonials can be featured'
      });
    }
    
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        featured: !testimonial.featured
      }
    });
    
    res.json({
      success: true,
      data: updated,
      message: updated.featured ? 'Testimonial featured on homepage' : 'Testimonial removed from featured'
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle featured status'
    });
  }
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete testimonials'
      });
    }
    
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonial not found'
      });
    }
    
    await prisma.testimonial.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete testimonial'
    });
  }
};