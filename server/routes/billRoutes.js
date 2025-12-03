import express from "express";
import {
  createBill,
  getBillById,
  updateBill,
  approveBill,
  rejectBill,
  getAllBills,
  deleteBill,
} from "../controllers/billController.js";
import { authMiddleware, isManagerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new bill
router.post("", createBill);

// Get all bills (with role-based filtering)
router.get("", getAllBills);

// Get by ID
router.get("/:id", getBillById);

// Update bill (only draft bills)
router.put("/:id", updateBill);

// Approve bill (Manager/Admin only)
router.post("/:id/approve", isManagerOrAdmin, approveBill);

// Reject bill (Manager/Admin only)
router.post("/:id/reject", isManagerOrAdmin, rejectBill);

// Delete bill (only draft bills)
router.delete("/:id", deleteBill);

export default router;
