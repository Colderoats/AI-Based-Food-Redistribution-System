import express from "express";

import adminRoutes from "./adminRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import businessRoutes from "./businessRoutes.js";
import donationRoutes from "./donationRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import ngoRoutes from "./ngoRoutes.js";
import surplusRoutes from "./surplusRoutes.js";

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/business", businessRoutes);
router.use("/donations", donationRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/ngo", ngoRoutes);
router.use("/surplus", surplusRoutes);

export default router;