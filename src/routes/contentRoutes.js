import express from 'express';
import {
  checkContentType,
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent
} from '../controllers/contentController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Direct file upload endpoint (used for uploading inline photos for structured lists like officials/facilities)
router.post('/upload', protect, restrictTo('super_admin', 'admin'), uploadImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
  }
  res.status(200).json({
    status: 'success',
    fileUrl: `/uploads/${req.file.filename}`
  });
});

// Define route-parameter-based endpoints
router.get('/:contentType', checkContentType, getAllContent);
router.get('/:contentType/:id', checkContentType, getContentById);

// Write operations are protected and restricted to administrators (super_admin or admin)
router.post('/:contentType', protect, restrictTo('super_admin', 'admin'), checkContentType, uploadImage, createContent);
router.put('/:contentType/:id', protect, restrictTo('super_admin', 'admin'), checkContentType, uploadImage, updateContent);
router.delete('/:contentType/:id', protect, restrictTo('super_admin', 'admin'), checkContentType, deleteContent);


export default router;
