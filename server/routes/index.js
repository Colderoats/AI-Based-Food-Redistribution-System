import express from "express";

import adminRoutes from "./adminRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import businessRoutes from "./businessRoutes.js";
import donationRoutes from "./donationRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import ngoRoutes from "./ngoRoutes.js";
import surplusRoutes from "./surplusRoutes.js";
import logisticsRoutes from "./logisticsRoutes.js";
import matchRoutes from "./matchRoutes.js";
import authRoutes from "./authRoutes.js";
import { getExpiryAlerts } from "../controllers/inventoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/business", businessRoutes);
router.use("/donations", donationRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/ngo", ngoRoutes);
router.use("/surplus", surplusRoutes);
router.use("/logistics", logisticsRoutes);
router.use("/matches", matchRoutes);
router.use("/auth", authRoutes);
router.get("/expiry-alerts", authMiddleware, roleMiddleware("business"), getExpiryAlerts);

export default router;
