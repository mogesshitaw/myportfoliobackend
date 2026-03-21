import { prisma } from '../index.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user's projects (if not admin)
    const projects = await prisma.project.findMany({
      where: userRole === 'admin' ? {} : { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        createdAt: true,
      }
    });

    // Get project counts
    const projectCounts = await prisma.project.aggregate({
      where: userRole === 'admin' ? {} : { userId },
      _count: true,
      _sum: { progress: true }
    });

    const activeProjects = await prisma.project.count({
      where: {
        userId: userRole === 'admin' ? undefined : userId,
        status: 'active'
      }
    });

    const completedProjects = await prisma.project.count({
      where: {
        userId: userRole === 'admin' ? undefined : userId,
        status: 'completed'
      }
    });

    // Get user stats (admin only)
    let userStats = null;
    if (userRole === 'admin') {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true }
      });
      const newUsersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      });
      const lastMonthUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            lt: new Date(new Date().setDate(1))
          }
        }
      });
      const growth = lastMonthUsers > 0 
        ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100 
        : 0;

      userStats = {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        growth: parseFloat(growth.toFixed(1))
      };
    }

    // Get engagement stats
    const likesCount = await prisma.like.count({
      where: userRole === 'admin' ? {} : {
        project: { userId }
      }
    });
    
    const commentsCount = await prisma.comment.count({
      where: userRole === 'admin' ? {} : {
        project: { userId }
      }
    });

    // Get testimonials (admin only)
    let testimonialStats = null;
    if (userRole === 'admin') {
      const totalTestimonials = await prisma.testimonial.count();
      const approvedTestimonials = await prisma.testimonial.count({
        where: { status: 'approved' }
      });
      const avgRating = await prisma.testimonial.aggregate({
        _avg: { rating: true }
      });

      testimonialStats = {
        total: totalTestimonials,
        approved: approvedTestimonials,
        averageRating: parseFloat((avgRating._avg.rating || 0).toFixed(1))
      };
    }

    // Get contacts (admin only)
    let contactStats = null;
    if (userRole === 'admin') {
      const totalContacts = await prisma.contact.count();
      const unreadContacts = await prisma.contact.count({
        where: { isRead: false }
      });
      const contactsThisMonth = await prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1))
          }
        }
      });

      contactStats = {
        total: totalContacts,
        unread: unreadContacts,
        thisMonth: contactsThisMonth
      };
    }

    res.json({
      success: true,
      data: {
        users: userStats,
        projects: {
          total: projectCounts._count,
          active: activeProjects,
          completed: completedProjects,
          featured: 0 // Add if you have featured projects
        },
        engagement: {
          totalLikes: likesCount,
          totalComments: commentsCount
        },
        testimonials: testimonialStats,
        contacts: contactStats,
        recentProjects: projects
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};