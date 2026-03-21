import { Request, Response } from "express"
import { prisma } from "../index.js"

// Get all public projects (no authentication required)
export const getAllPublicProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { 
        status: "active" // Only show active projects
      },
      select: {
        id: true,
        title: true,
        description: true,
        detailedDescription: true,
        technologies: true,
        domainName: true,
        liveUrl: true,
        githubUrl: true,
        status: true,
        progress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get public projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects"
    })
  }
}

// Get single public project by ID (no authentication required)
export const getPublicProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        detailedDescription: true,
        technologies: true,
        domainName: true,
        liveUrl: true,
        githubUrl: true,
        status: true,
        progress: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error("Get public project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch project"
    })
  }
}

// Get public projects by user ID (no authentication required)
export const getPublicProjectsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const projects = await prisma.project.findMany({
      where: { 
        userId,
        status: "active"
      },
      select: {
        id: true,
        title: true,
        description: true,
        technologies: true,
        domainName: true,
        liveUrl: true,
        githubUrl: true,
        status: true,
        progress: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get user public projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user projects"
    })
  }
}

// Get public project statistics (no authentication required)
export const getPublicProjectStats = async (req: Request, res: Response) => {
  try {
    const totalProjects = await prisma.project.count({
      where: { status: "active" }
    })
    
    const projectsByTechnology = await prisma.project.groupBy({
      by: ['technologies'],
      where: { status: "active" },
      _count: true
    })

    const mostLiked = await prisma.project.findMany({
      where: { status: "active" },
      take: 5,
      orderBy: {
        likes: {
          _count: "desc"
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: { likes: true }
        }
      }
    })

    const mostCommented = await prisma.project.findMany({
      where: { status: "active" },
      take: 5,
      orderBy: {
        comments: {
          _count: "desc"
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: { comments: true }
        }
      }
    })

    res.json({
      success: true,
      data: {
        totalProjects,
        projectsByTechnology,
        mostLiked,
        mostCommented
      }
    })
  } catch (error) {
    console.error("Get public stats error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics"
    })
  }
}

// Get recent public projects (for homepage)
export const getRecentPublicProjects = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query

    const projects = await prisma.project.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        technologies: true,
        domainName: true,
        liveUrl: true,
        githubUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: Number(limit)
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get recent projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent projects"
    })
  }
}
// backend/controllers/projectController.ts
// አሁን ባለው ፋይል ላይ ይህን ያክሉ

// Get featured projects (limit 3)
export const getFeaturedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { 
        status: "active",
        featured: true  // ፊቸርድ የሆኑትን ብቻ
      },
      take: 3,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get featured projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured projects"
    })
  }
}

// Update project featured status (admin only)
export const updateProjectFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { featured } = req.body

    const project = await prisma.project.update({
      where: { id },
      data: { featured }
    })

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error("Update project featured error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update project featured status"
    })
  }
}