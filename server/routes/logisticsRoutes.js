import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createAvailability, getAvailability } from "../controllers/logisticsController.js";

const router = express.Router();
router.use(authMiddleware);
router.route("/availability").get(getAvailability).post(createAvailability);
export default router;
