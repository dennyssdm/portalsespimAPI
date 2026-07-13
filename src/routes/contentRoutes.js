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

// Define route-parameter-based endpoints
router.get('/:contentType', checkContentType, getAllContent);
router.get('/:contentType/:id', checkContentType, getContentById);

// Write operations are protected and restricted to administrators (super_admin or admin)
router.post('/:contentType', protect, restrictTo('super_admin', 'admin'), checkContentType, uploadImage, createContent);
router.put('/:contentType/:id', protect, restrictTo('super_admin', 'admin'), checkContentType, uploadImage, updateContent);
router.delete('/:contentType/:id', protect, restrictTo('super_admin', 'admin'), checkContentType, deleteContent);


export default router;
