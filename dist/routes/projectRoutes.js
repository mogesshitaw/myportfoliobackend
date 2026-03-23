import { Router } from "express";
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, likeProject, addComment, getProjectStats, getUserProjects, getProjectComments } from "../controllers/projectController.ts";
import { authenticate } from "../middleware/auth.ts";
const router = Router();
// Public routes
router.get("/", getAllProjects);
router.get("/stats", getProjectStats);
router.get("/:id", getProjectById);
// Protected routes (require authentication)
router.use(authenticate);
// User's own projects
router.get("/user/me", getUserProjects);
// CRUD operations
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
// Interactions
router.post("/:id/like", likeProject);
router.post("/:id/comments", addComment);
router.get("/:id/comments", getProjectComments);
export default router;
