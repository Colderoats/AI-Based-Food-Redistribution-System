import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMatches } from "../controllers/matchController.js";

const router = express.Router();
router.get("/", authMiddleware, getMatches);
export default router;
