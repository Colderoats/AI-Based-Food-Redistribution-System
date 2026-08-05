import express from "express";
import {
  registerNGO,
  loginNGO,
  getNGOProfile,
  updateNGOProfile,
} from "../controllers/ngoController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Authentication
router.post("/register", registerNGO);
router.post("/login", loginNGO);

// Profile
router.get("/profile", authMiddleware, roleMiddleware("ngo"), getNGOProfile);
router.put("/profile", authMiddleware, roleMiddleware("ngo"), updateNGOProfile);

export default router;
