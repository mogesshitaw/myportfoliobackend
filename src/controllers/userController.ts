import type { Request, Response } from "express"
import { prisma } from "../index.ts"

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: { 
            projects: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    })
  }
}

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true,
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          take: 5
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    })
  }
}

// Create new user (admin)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password, role = "client" } = req.body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists"
      })
    }

    // Hash password
    const bcrypt = await import("bcryptjs")
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    res.status(201).json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to create user"
    })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { fullName, role, isActive } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        role,
        isActive
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update user"
    })
  }
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.user.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete user"
    })
  }
}

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true
      }
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error("Toggle user status error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update user status"
    })
  }
}

// Get user statistics (for dashboard)
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    })
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)) // First day of current month
        }
      }
    })

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersThisMonth
      }
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch user statistics"
    })
  }
}
