import { Router } from "express"
import { 
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  toggleUserStatus,      // ✅ አክል
  bulkUpdateUserStatus    // ✅ አክል
} from "../controllers/adminController.ts"
import { authenticate } from "../middleware/auth.ts"
import { authorize } from "../middleware/auth.ts"

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorize("admin"))

// User management routes
router.get("/users", getUsers)
router.get("/users/stats", getUserStats)
router.get("/users/:id", getUserById)
router.post("/users", createUser)
router.put("/users/:id", updateUser)
router.patch("/users/:id/status", toggleUserStatus)  // ✅ አዲስ መስመር
router.delete("/users/:id", deleteUser)
router.post("/users/bulk-status", bulkUpdateUserStatus)  // ✅ አዲስ መስመር

export default router