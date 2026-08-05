import express from "express";
import {
  requestDonation,
  approveDonation,
  rejectDonation,
  completeDonation,
  getDonations,
} from "../controllers/donationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Donation Workflow
router.post("/request", authMiddleware, roleMiddleware("ngo"), requestDonation);

router.put("/approve/:id", authMiddleware, roleMiddleware("business"), approveDonation);

router.put("/reject/:id", authMiddleware, roleMiddleware("business"), rejectDonation);

router.put("/complete/:id", authMiddleware, roleMiddleware("business", "ngo"), completeDonation);

router.get("/", authMiddleware, roleMiddleware("business", "ngo"), getDonations);

export default router;
