import express from "express";
import {
  requestDonation,
  approveDonation,
  rejectDonation,
  completeDonation,
  getDonations,
} from "../controllers/donationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Donation Workflow
router.post("/request", authMiddleware, requestDonation);

router.put("/approve/:id", authMiddleware, approveDonation);

router.put("/reject/:id", authMiddleware, rejectDonation);

router.put("/complete/:id", authMiddleware, completeDonation);

router.get("/", authMiddleware, getDonations);

export default router;