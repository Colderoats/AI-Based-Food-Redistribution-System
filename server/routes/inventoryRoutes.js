import express from "express";
import {
  addInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getExpiryAlerts,
  lookupBarcode,
  removeExpiredInventory,
  removeInventoryItems,
} from "../controllers/inventoryController.js";


import { uploadInventoryCSV } from "../controllers/csvController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ===============================
// Inventory CRUD Routes
// ===============================

// Add Inventory Item
router.use(authMiddleware, roleMiddleware("business"));
router.post("/", addInventory);

// Upload Inventory CSV
router.post(
  "/upload",
  upload.single("file"),
  uploadInventoryCSV
);

router.get("/alerts", getExpiryAlerts);
router.get("/barcode/:barcode", lookupBarcode);
router.delete("/expired", removeExpiredInventory);
router.delete("/bulk", removeInventoryItems);

// Get All Inventory Items
router.get("/", getInventory);

// Get Inventory By ID
router.get("/:id", getInventoryById);

// Update Inventory Item
router.put("/:id", updateInventory);

// Delete Inventory Item
router.delete("/:id", deleteInventory);

export default router;
