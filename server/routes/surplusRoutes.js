import express from "express";
import {
  createSurplus,
  getAllSurplus,
  getSurplusById,
  updateSurplus,
  deleteSurplus,
} from "../controllers/surplusController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Surplus Food
router.post("/", authMiddleware, createSurplus);

router.get("/", authMiddleware, getAllSurplus);

router.get("/:id", authMiddleware, getSurplusById);

router.put("/:id", authMiddleware, updateSurplus);

router.delete("/:id", authMiddleware, deleteSurplus);

export default router;