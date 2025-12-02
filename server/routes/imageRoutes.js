import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { uploadImages, uploadBase64Image, deleteImage } from '../controllers/imageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload multiple images
router.post('/upload', upload.array('images', 10), uploadImages);

// Upload single base64 image
router.post('/upload-base64', uploadBase64Image);

// Delete image
router.post('/delete', deleteImage);

export default router;
