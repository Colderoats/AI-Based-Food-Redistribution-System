import express from "express";
import {
  loginAdmin,
  getDashboard,
  getAllBusinesses,
  getAllNGOs,
} from "../controllers/adminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Authentication
router.post("/login", loginAdmin);

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboard
);

// User Management
router.get(
  "/businesses",
  authMiddleware,
  roleMiddleware("admin"),
  getAllBusinesses
);

router.get(
  "/ngos",
  authMiddleware,
  roleMiddleware("admin"),
  getAllNGOs
);

export default router;