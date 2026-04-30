import { Router } from "express"
import upload from "../middleware/upload.js"
import { 
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  addComment,
  getProjectStats,
  getUserProjects,
  getProjectComments,
  getAllfeaturedProjects
} from "../controllers/projectController.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()

// Public routes
router.get("/", getAllProjects)
router.get("/featured",getAllfeaturedProjects)
router.get("/stats", getProjectStats)
router.get("/:id", getProjectById)

// Protected routes (require authentication)
router.use(authenticate)

// User's own projects
router.get("/user/me", getUserProjects)

// CRUD operations
router.post("/", createProject)
router.put("/:id", updateProject)
router.delete("/:id", deleteProject)

// Interactions
router.post("/:id/like", likeProject)
router.post("/:id/comments", addComment)
router.get("/:id/comments", getProjectComments)

export default router