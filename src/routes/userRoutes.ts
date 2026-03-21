import { Router } from "express"
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  getUserStats 
} from "../controllers/userController.js"
import { authenticate } from "../middleware/auth.js"
import { authorize } from "../middleware/auth.js"

const router = Router()

// All user routes require authentication
router.use(authenticate)

// Admin only routes
router.get("/stats", authorize("admin"), getUserStats)
router.get("/", authorize("admin"), getUsers)
router.post("/", authorize("admin"), createUser)

// Routes accessible by admin or the user themselves
router.get("/:id", getUserById)
router.put("/:id", updateUser)
router.delete("/:id", authorize("admin"), deleteUser)
router.patch("/:id/status", authorize("admin"), toggleUserStatus)

export default router
