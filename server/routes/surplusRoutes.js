import express from "express";
import {
  createSurplus,
  getAllSurplus,
  getSurplusById,
  updateSurplus,
  deleteSurplus,
} from "../controllers/surplusController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Surplus Food
router.post("/", authMiddleware, roleMiddleware("business"), createSurplus);

router.get("/", authMiddleware, roleMiddleware("business", "ngo"), getAllSurplus);

router.get("/:id", authMiddleware, roleMiddleware("business", "ngo"), getSurplusById);

router.put("/:id", authMiddleware, roleMiddleware("business"), updateSurplus);

router.delete("/:id", authMiddleware, roleMiddleware("business"), deleteSurplus);

export default router;
