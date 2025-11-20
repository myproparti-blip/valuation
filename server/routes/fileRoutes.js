import express from "express";
import { 
    createFile, 
    getAllFiles, 
    getFileById, 
    updateFileStatus 
} from "../controllers/fileController.js";
import { authMiddleware, isManagerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("", createFile);          
router.get("", getAllFiles);          
router.get("/:id", getFileById);      
// Change from PATCH to POST to match frontend, or keep PATCH and fix frontend
router.patch("/:id/status", isManagerOrAdmin, updateFileStatus);
// Add POST endpoint for compatibility
router.post("/:id/status", isManagerOrAdmin, updateFileStatus);


export default router;