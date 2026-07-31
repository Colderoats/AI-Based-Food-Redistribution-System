import express from "express";
import {
  getBusinessAnalytics,
  getNGOAnalytics,
  getAdminAnalytics,
} from "../controllers/analyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Analytics
router.get("/business", authMiddleware, getBusinessAnalytics);

router.get("/ngo", authMiddleware, getNGOAnalytics);

router.get("/admin", authMiddleware, getAdminAnalytics);

export default router;