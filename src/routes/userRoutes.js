import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Read-only access for admins and stakeholders
router.get('/', restrictTo('super_admin', 'admin', 'stakeholder'), getAllUsers);
router.get('/:id', restrictTo('super_admin', 'admin', 'stakeholder'), getUserById);

// Write access restricted to super_admin only
router.post('/', restrictTo('super_admin'), createUser);
router.put('/:id', restrictTo('super_admin'), updateUser);
router.delete('/:id', restrictTo('super_admin'), deleteUser);

export default router;
