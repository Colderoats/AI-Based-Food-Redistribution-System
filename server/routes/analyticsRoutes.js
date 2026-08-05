import express from "express";
import {
  getBusinessAnalytics,
  getNGOAnalytics,
  getAdminAnalytics,
} from "../controllers/analyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Analytics
router.get("/business", authMiddleware, roleMiddleware("business"), getBusinessAnalytics);

router.get("/ngo", authMiddleware, roleMiddleware("ngo"), getNGOAnalytics);

router.get("/admin", authMiddleware, roleMiddleware("admin"), getAdminAnalytics);

export default router;
