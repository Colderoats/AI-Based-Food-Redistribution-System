import express from "express";
import {
  registerBusiness,
  loginBusiness,
  getBusinessProfile,
  updateBusinessProfile,
} from "../controllers/businessController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", registerBusiness);
router.post("/login", loginBusiness);

// Profile
router.get("/profile", authMiddleware, roleMiddleware("business"), getBusinessProfile);
router.put("/profile", authMiddleware, roleMiddleware("business"), updateBusinessProfile);

export default router;
