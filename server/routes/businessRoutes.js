import express from "express";
import {
  registerBusiness,
  loginBusiness,
  getBusinessProfile,
  updateBusinessProfile,
} from "../controllers/businessController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", registerBusiness);
router.post("/login", loginBusiness);

// Profile
router.get("/profile", authMiddleware, getBusinessProfile);
router.put("/profile", authMiddleware, updateBusinessProfile);

export default router;