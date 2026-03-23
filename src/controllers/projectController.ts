import type { Request, Response } from "express"
import { prisma } from "../index.ts"
import { emailService } from '../services/emailService.ts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get all projects (public)
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "active" },
      include: {
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
          orderBy: { createdAt: "desc" },
          take: 5
        },
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects"
    })
  }
}

// Get single project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
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
    console.error("Get project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch project"
    })
  }
}

// Helper function to delete old image
const deleteOldImage = (imageUrl: string) => {
  try {
    if (!imageUrl) return
    
    // Extract filename from URL
    const filename = imageUrl.split('/').pop()
    if (!filename) return
    
    const filePath = path.join(__dirname, '../uploads', filename)
    
    // Check if file exists and delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted old image: ${filename}`)
    }
  } catch (error) {
    console.error("Failed to delete old image:", error)
  }
}

// Create new project (authenticated users)
export const createProject = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      detailedDescription,  
      technologies, 
      domainName,         
      liveUrl,            
      githubUrl,          
      status,
      imageUrl            // አዲስ የምስል ዩአርኤል
    } = req.body
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      })
    }
    
    const userId = req.user.id

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required"
      })
    }

    const techArray = Array.isArray(technologies) ? technologies : 
                      typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()) : 
                      []

    const project = await prisma.project.create({
      data: {
        title,
        description,
        detailedDescription: detailedDescription || description,
        technologies: techArray,
        domainName: domainName || null,     
        liveUrl: liveUrl || null,           
        githubUrl: githubUrl || null,       
        imageUrl: imageUrl || null,          // ምስል ዩአርኤል ማስቀመጥ
        status: status || "active",
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })

    // Send email notification
    try {
      await emailService.sendProjectCreated(
        userId,
        project.title,
        project.id
      )
      console.log(`📧 Email notification sent for project: ${project.id}`)
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
    }

    // Create admin notification
    try {
      const admin = await prisma.user.findFirst({
        where: { role: "admin" }
      })
      
      if (admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "project_created",
            title: "New Project Created",
            content: `${project.user.fullName} created a new project: ${project.title}`,
            data: { projectId: project.id }
          }
        })
      }
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError)
    }

    res.status(201).json({
      success: true,
      data: project
    })

  } catch (error) {
    console.error("❌ Create project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create project",
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Update project (owner only) - ከምስል ማዘመን ድጋፍ ጋር
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { 
      title, 
      description, 
      detailedDescription,  
      technologies, 
      domainName,          
      liveUrl,             
      githubUrl,           
      status, 
      progress,
      imageUrl              // አዲስ የምስል ዩአርኤል
    } = req.body
    const userId = req.user!.id

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: "Project not found or you don't have permission"
      })
    }

    // አዲስ ምስል ከተጫነ የድሮውን ምስል ሰርዝ
    if (imageUrl && existingProject.imageUrl && imageUrl !== existingProject.imageUrl) {
      deleteOldImage(existingProject.imageUrl)
    }

    const techArray = Array.isArray(technologies) ? technologies : 
                      typeof technologies === 'string' ? technologies.split(',').map(t => t.trim()) : 
                      existingProject.technologies

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title || existingProject.title,
        description: description || existingProject.description,
        detailedDescription: detailedDescription !== undefined ? detailedDescription : existingProject.detailedDescription,
        technologies: techArray,
        domainName: domainName !== undefined ? domainName : existingProject.domainName,
        liveUrl: liveUrl !== undefined ? liveUrl : existingProject.liveUrl,
        githubUrl: githubUrl !== undefined ? githubUrl : existingProject.githubUrl,
        imageUrl: imageUrl !== undefined ? imageUrl : existingProject.imageUrl,
        status: status || existingProject.status,
        progress: progress !== undefined ? progress : existingProject.progress
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update project"
    })
  }
}

// Delete project (owner or admin) - ምስልንም ሰርዝ
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }

    if (project.userId !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this project"
      })
    }

    // የፕሮጀክቱን ምስል ሰርዝ (ካለ)
    if (project.imageUrl) {
      deleteOldImage(project.imageUrl)
    }

    // ሁሉንም የፕሮጀክቱን ኮሜንቶች እና ላይኮች ሰርዝ
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { projectId: id } }),
      prisma.like.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } })
    ])

    res.json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete project"
    })
  }
}

// ... የተቀሩት ተግባራት (like, comment, stats, etc.) እንዳሉ ይቆያሉ
// Like a project
export const likeProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
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

    const existingLike = await prisma.like.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId
        }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      })

      res.json({
        success: true,
        message: "Project unliked",
        liked: false,
        likesCount: await prisma.like.count({ where: { projectId: id } })
      })
    } else {
      await prisma.like.create({
        data: {
          projectId: id,
          userId
        }
      })

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true }
      })

      if (project.userId !== userId) {
        try {
          await prisma.notification.create({
            data: {
              userId: project.userId,
              type: "new_like",
              title: "❤️ New Like on Your Project",
              content: `${user?.fullName || 'Someone'} liked your project: ${project.title}`,
              data: { 
                projectId: id,
                projectTitle: project.title,
                likerName: user?.fullName || 'Someone'
              }
            }
          })

          await emailService.sendNewLike(
            project.userId,
            user?.fullName || 'Someone',
            project.title,
            id
          )
          console.log(`📧 Like email sent to ${project.user.email}`)
        } catch (notifError) {
          console.error("Failed to send like notification:", notifError)
        }
      }

      const likesCount = await prisma.like.count({ 
        where: { projectId: id } 
      })

      res.json({
        success: true,
        message: "Project liked",
        liked: true,
        likesCount
      })
    }
  } catch (error) {
    console.error("❌ Like project error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to like project",
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Add comment to project
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.user!.id

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      })
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Comment content is required"
      })
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { 
        userId: true, 
        title: true,
        user: {
          select: {
            email: true,
            fullName: true
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

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        projectId: id,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true
          }
        }
      }
    })

    if (project.userId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: project.userId,
            type: "new_comment",
            title: "💬 New Comment on Your Project",
            content: `${req.user?.fullName || 'Someone'} commented on your project: ${project.title}`,
            data: { 
              projectId: id, 
              commentId: comment.id,
              projectTitle: project.title,
              commentContent: content,
              commenterName: req.user?.fullName || 'Someone'
            }
          }
        })

        await emailService.sendNewComment(
          project.userId,
          req.user?.fullName || 'Someone',
          project.title,
          id,
          content
        )
        console.log(`📧 Comment email sent to ${project.user.email}`)
      } catch (notifError) {
        console.error("Failed to send comment notification:", notifError)
      }
    }

    const commentsCount = await prisma.comment.count({
      where: { projectId: id }
    })

    res.status(201).json({
      success: true,
      data: {
        ...comment,
        commentsCount
      }
    })

  } catch (error) {
    console.error("❌ Add comment error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get project statistics
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const totalProjects = await prisma.project.count()
    const activeProjects = await prisma.project.count({
      where: { status: "active" }
    })
    const completedProjects = await prisma.project.count({
      where: { status: "completed" }
    })
    const projectsThisMonth = await prisma.project.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1))
        }
      }
    })

    const mostLiked = await prisma.project.findMany({
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

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        projectsThisMonth,
        mostLiked
      }
    })
  } catch (error) {
    console.error("Get project stats error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch project statistics"
    })
  }
}

// Get user's projects
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error("Get user projects error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user projects"
    })
  }
}

// Get comments for a project
export const getProjectComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      })
    }

    const comments = await prisma.comment.findMany({
      where: { projectId: id },
      include: {
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
    })

    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments"
    })
  }
}