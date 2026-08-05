import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { getMatches } from "../controllers/matchController.js";

const router = express.Router();
router.get("/", authMiddleware, roleMiddleware("business", "ngo"), getMatches);
export default router;
