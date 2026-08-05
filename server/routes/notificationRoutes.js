import express from "express";
import { createNotification, getNotifications, getUserNotifications } from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/inventory", authMiddleware, roleMiddleware("business"), getNotifications);
router.get("/me", authMiddleware, getUserNotifications);
router.post("/create", authMiddleware, createNotification);

export default router;
