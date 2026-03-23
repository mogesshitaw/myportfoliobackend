import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../index.ts"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
        isActive: boolean
        fullName?: string
      }
    }
  }
}

// Authentication middleware - verifies token and attaches user to request
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        isActive: true,
        fullName: true
      }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: "User not found or inactive"
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, error: "Invalid token" })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, error: "Token expired" })
    }
    console.error("Authentication error:", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  
  next();
};

// Check if user is owner or admin
export const isOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  const userId = req.user.id;
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || userId === resourceUserId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'You do not have permission to perform this action'
  });
};

// Role-based authorization - can be used with multiple roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required role: ${roles.join(' or ')}`
      })
    }

    next()
  }
}

// Optional: Check if user is authenticated (just checks if user exists)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }
  next();
};