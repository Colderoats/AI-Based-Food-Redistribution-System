import express from "express";
import {
  registerNGO,
  loginNGO,
  getNGOProfile,
  updateNGOProfile,
} from "../controllers/ngoController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", registerNGO);
router.post("/login", loginNGO);

// Profile
router.get("/profile", authMiddleware, getNGOProfile);
router.put("/profile", authMiddleware, updateNGOProfile);

export default router;