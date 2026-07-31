import express from "express";
import {
  addInventory,
  getInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";


import { uploadInventoryCSV } from "../controllers/csvController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ===============================
// Inventory CRUD Routes
// ===============================

// Add Inventory Item
router.post("/", authMiddleware, addInventory);

// Upload Inventory CSV
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadInventoryCSV
);

// Get All Inventory Items
router.get("/", authMiddleware, getInventory);

// Get Inventory By ID
router.get("/:id", authMiddleware, getInventoryById);

// Update Inventory Item
router.put("/:id", authMiddleware, updateInventory);

// Delete Inventory Item
router.delete("/:id", authMiddleware, deleteInventory);

export default router;