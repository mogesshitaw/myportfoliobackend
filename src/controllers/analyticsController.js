import { prisma } from '../index.ts';

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { timeframe = '30days' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get users analytics
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
    
    // Calculate user growth
    const lastMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lt: new Date(new Date().setDate(1))
        }
      }
    });
    const userGrowth = lastMonthUsers > 0 
      ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;
    
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // Get projects analytics
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: 'active' }
    });
    const completedProjects = await prisma.project.count({
      where: { status: 'completed' }
    });
    const featuredProjects = await prisma.project.count({
      where: { featured: true }
    });
    
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    // Get technologies from all projects
    const allProjects = await prisma.project.findMany({
      select: { technologies: true }
    });
    
    const techCount = {};
    allProjects.forEach(project => {
      project.technologies.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });
    
    const projectsByTechnology = Object.entries(techCount)
      .map(([technology, count]) => ({ technology, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Monthly project creation (last 6 months)
    const monthlyCreation = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await prisma.project.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      });
      monthlyCreation.push({ month, count });
    }

    // Get engagement analytics
    const totalLikes = await prisma.like.count();
    const totalComments = await prisma.comment.count();
    const averageLikesPerProject = totalProjects > 0 ? totalLikes / totalProjects : 0;
    const averageCommentsPerProject = totalProjects > 0 ? totalComments / totalProjects : 0;

    // Get testimonials analytics
    const totalTestimonials = await prisma.testimonial.count();
    const approvedTestimonials = await prisma.testimonial.count({
      where: { status: 'approved' }
    });
    const pendingTestimonials = await prisma.testimonial.count({
      where: { status: 'pending' }
    });
    
    const testimonialRatings = await prisma.testimonial.aggregate({
      _avg: { rating: true }
    });
    const averageRating = testimonialRatings._avg.rating || 0;

    // Get contacts analytics
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
    
    const contactsByService = await prisma.contact.groupBy({
      by: ['service'],
      _count: { service: true },
      where: {
        service: {
          not: null
        }
      }
    });

    // Get top projects by engagement
    const topProjects = await prisma.project.findMany({
      take: 5,
      orderBy: [
        { likes: { _count: 'desc' } }
      ],
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    const formattedTopProjects = topProjects.map(project => ({
      id: project.id,
      title: project.title,
      likes: project._count.likes,
      comments: project._count.comments
    }));

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growth: parseFloat(userGrowth.toFixed(1)),
          byRole: usersByRole.map(r => ({ role: r.role, count: r._count.role }))
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          featured: featuredProjects,
          byStatus: projectsByStatus.map(s => ({ status: s.status, count: s._count.status })),
          byTechnology: projectsByTechnology,
          monthlyCreation: monthlyCreation
        },
        engagement: {
          totalLikes,
          totalComments,
          averageLikesPerProject: parseFloat(averageLikesPerProject.toFixed(1)),
          averageCommentsPerProject: parseFloat(averageCommentsPerProject.toFixed(1))
        },
        testimonials: {
          total: totalTestimonials,
          approved: approvedTestimonials,
          pending: pendingTestimonials,
          averageRating: parseFloat(averageRating.toFixed(1))
        },
        contacts: {
          total: totalContacts,
          unread: unreadContacts,
          thisMonth: contactsThisMonth,
          byService: contactsByService.map(c => ({ service: c.service, count: c._count.service }))
        },
        topProjects: formattedTopProjects
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
};