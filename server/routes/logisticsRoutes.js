import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { createAvailability, getAvailability } from "../controllers/logisticsController.js";

const router = express.Router();
router.use(authMiddleware, roleMiddleware("business", "ngo"));
router.route("/availability").get(getAvailability).post(createAvailability);
export default router;
