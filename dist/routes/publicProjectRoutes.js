import { Router } from "express";
import { getAllPublicProjects, getPublicProjectById, getPublicProjectsByUser, getPublicProjectStats, getRecentPublicProjects } from "../controllers/publicProjectController.ts";
const router = Router();
// Public routes - no authentication required
router.get("/projects", getAllPublicProjects);
router.get("/projects/recent", getRecentPublicProjects);
router.get("/projects/stats", getPublicProjectStats);
router.get("/projects/:id", getPublicProjectById);
router.get("/users/:userId/projects", getPublicProjectsByUser);
// In your Express server file (e.g., server.js or index.js)
router.get('/public', getAllPublicProjects);
router.get('/public/stats', getPublicProjectStats);
router.get('/public/:id', getPublicProjectById);
router.get('/user/:userId', getPublicProjectsByUser);
router.get('/recent', getRecentPublicProjects);
export default router;
