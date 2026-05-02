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
  getAllfeaturedProjects,
  getAllProjectwithouttoken
} from "../controllers/projectController.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()

router.get("/featured",getAllfeaturedProjects)
router.get("/notoken",getAllProjectwithouttoken);

// Public routes
router.use(authenticate)
router.get("/", getAllProjects)
router.get("/stats", getProjectStats)
router.get("/:id", getProjectById)

// Protected routes (require authentication)
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