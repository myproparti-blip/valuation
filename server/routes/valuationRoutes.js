import express from "express";
import multer from "multer";
import { createValuation, getValuationById, updateValuation, managerSubmit, getAllValuations } from "../controllers/valuationController.js";
import { authMiddleware, isManagerOrAdmin } from "../middleware/authMiddleware.js";

// FILE UPLOAD HANDLER
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  }
});

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create new valuation
router.post("", createValuation);

// Get all valuations (with role-based filtering)
router.get("", getAllValuations);

// Get by ID
router.get("/:id", getValuationById);

// Update valuation (only user can update their own pending form)
// Use a custom middleware to handle FormData with files
router.put(
  "/:id",
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: "File upload error", error: err.message });
      }
      next();
    });
  },
  updateValuation
);

// Manager/Admin submit action (approve/reject)
router.post("/:id/manager-submit", isManagerOrAdmin, managerSubmit);

export default router;
